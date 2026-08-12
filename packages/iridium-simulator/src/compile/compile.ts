import Emitter from "./Emitter";
import { MAGIC_WORD, SectionCode, VERSION_WORD } from "./codes";
import { FunctionTable, TypeTable } from "./symbolTables.ts";
import { evaluateInitialValues } from "./evaluate";
import {
  CONVERT_TO_CONCENTRATIONS_NAME,
  CONVERT_TO_AMOUNTS_NAME,
  CORE_NAMESPACE,
  IMPORT_NAMESPACE,
  MEMORY_IMPORT_NAME,
  RHS_NAME,
  CONVERT_RESET_NAME,
} from "../names";
import { compileRhs, RHS_PARAMS, RHS_RESULTS } from "./rhs";
import { compileEvents } from "./event";
import {
  predefinedFuncDefs,
  POW_RESERVED_NAME,
  type CompiledFunction,
  type ImportedFunction,
  type WasmFunction,
  AND_RESERVED_NAME,
  OR_RESERVED_NAME,
  PIECEWISE_NAME,
  MOD_RESERVED_NAME,
} from "./functions";
import { CompileInvariantError, CompileModelError } from "./errors";
import { Compilation } from "./Compilation.ts";
import {
  compileConvert,
  CONVERT_PARAMS,
  CONVERT_RESULTS,
} from "./convertConcentration.ts";
import type { IridiumModel } from "../ir/model.ts";
import {
  walkExpression,
  type IridiumExpression,
  type IridiumExpressionListener,
} from "../ir/ast.ts";
import type {
  RuntimeEvent,
  RuntimeModel,
  RuntimePieceEvent,
} from "../runtime/model.ts";
import { compileAllUserDefinedFunctions } from "./userDefinedFunction.ts";

/** Used for testing. */
export const compileIntermediate = (
  ir: IridiumModel,
): {
  compilation: Compilation;
  imports: string[];
  runtimeEvents: (RuntimePieceEvent | RuntimeEvent)[];
  bytecode: Uint8Array;
} => {
  const compilation = new Compilation(ir);

  const referencedFunctions = Array.from(
    getReferencedFunctions(compilation, { shouldTrackPiecewise: true }),
  );

  const functions: WasmFunction[] = [
    {
      kind: "compile",
      isExported: true,
      name: RHS_NAME,
      params: RHS_PARAMS,
      results: RHS_RESULTS,
      compileBody: (functionTable) =>
        compileRhs(compilation, functionTable).getOutput(),
    },
    {
      kind: "compile",
      isExported: true,
      name: CONVERT_TO_AMOUNTS_NAME,
      params: CONVERT_PARAMS,
      results: CONVERT_RESULTS,
      compileBody: (_functionTable) =>
        compileConvert(compilation, "toAmount").getOutput(),
    },
    {
      kind: "compile",
      isExported: true,
      name: CONVERT_TO_CONCENTRATIONS_NAME,
      params: CONVERT_PARAMS,
      results: CONVERT_RESULTS,
      compileBody: (_functionTable) =>
        compileConvert(compilation, "toConcentrations").getOutput(),
    },
    {
      kind: "compile",
      isExported: true,
      name: CONVERT_RESET_NAME,
      params: CONVERT_PARAMS,
      results: CONVERT_RESULTS,
      compileBody: (_functionTable) =>
        compileConvert(compilation, "reset").getOutput(),
    },
    ...referencedFunctions.map((name) => {
      if (Object.hasOwn(predefinedFuncDefs, name)) {
        return predefinedFuncDefs[name];
      } else {
        throw new CompileModelError(`Unbound function: ${name}`);
      }
    }),
    ...compileAllUserDefinedFunctions(ir.functions),
  ];

  let runtimeEvents: (RuntimePieceEvent | RuntimeEvent)[] = [];
  if (compilation.piecewisePieces.size > 0 || compilation.events.size > 0) {
    const eventsResult = compileEvents(compilation);
    functions.push(...eventsResult.functions);
    runtimeEvents = eventsResult.runtimeEvents;
  }

  return {
    compilation,
    imports: referencedFunctions,
    runtimeEvents: runtimeEvents,
    bytecode: compileFunctions(functions),
  };
};

export const compile = async (ir: IridiumModel): Promise<RuntimeModel> => {
  const { compilation, imports, runtimeEvents, bytecode } =
    compileIntermediate(ir);

  const initialValues = await evaluateInitialValues(compilation);

  return {
    y: compilation.yVars.map((name) => ({
      name,
      initialValue: initialValues.get(name) ?? 0,
    })),
    p: compilation.pVars.map((name) => ({
      name,
      initialValue: initialValues.get(name) ?? 0,
    })),
    reactions: Array.from(compilation.reactions.values()).map((r) => r.name),
    events: runtimeEvents,
    wasmModule: await WebAssembly.compile(bytecode),
    funcImports: imports,
  };
};

export const getReferencedFunctions = (
  compilation: Compilation,
  { shouldTrackPiecewise }: { shouldTrackPiecewise: boolean },
): Set<string> => {
  let isWalkingFunction = false;
  const referenced = new Set<string>();
  const listener: IridiumExpressionListener = {
    beforeCall(expr) {
      const { name } = expr;
      if (name === PIECEWISE_NAME) {
        if (shouldTrackPiecewise && !isWalkingFunction) {
          const cases = [];
          for (let i = 0; i + 2 < expr.args.length; i += 2) {
            cases.push({ branch: expr.args[i], condition: expr.args[i + 1] });
          }

          for (let i = 0; i < cases.length; i++) {
            let pieceExpression: IridiumExpression | undefined;
            for (let j = 0; j < cases.length; j++) {
              let conditionExpression: IridiumExpression;
              if (j == i) {
                conditionExpression = cases[j].condition;
              } else {
                conditionExpression = {
                  kind: "unary",
                  op: "not",
                  expr: cases[j].condition,
                };
              }

              if (pieceExpression) {
                pieceExpression = {
                  kind: "binary",
                  op: "and",
                  left: pieceExpression,
                  right: conditionExpression,
                };
              } else {
                pieceExpression = conditionExpression;
              }
            }

            compilation.addPiecewisePiece(cases[i].condition, pieceExpression!);
          }
        }
      } else if (
        Object.hasOwn(predefinedFuncDefs, name) &&
        predefinedFuncDefs[name].kind !== "inline"
      ) {
        referenced.add(name);
      }
    },
    beforeBinary({ op }) {
      if (op === "pow") {
        referenced.add(POW_RESERVED_NAME);
      } else if (op === "and") {
        referenced.add(AND_RESERVED_NAME);
      } else if (op === "or") {
        referenced.add(OR_RESERVED_NAME);
      } else if (op === "mod") {
        referenced.add(MOD_RESERVED_NAME);
      }
    },
  };

  compilation.forAllExpressions((expr, ctx) => {
    isWalkingFunction = ctx === "functions";
    walkExpression(expr, listener);
  });

  const result = new Set<string>();

  // resolve any dependencies
  const referencedQueue = Array.from(referenced);
  while (true) {
    const name = referencedQueue.pop();
    if (!name) break;
    if (result.has(name)) continue;

    result.add(name);

    const definition = predefinedFuncDefs[name];
    if (definition && "depends" in definition && definition.depends) {
      for (const dependency of definition.depends) {
        referencedQueue.push(dependency);
      }
    }
  }

  return result;
};

/**
 * Compiles a list of functions into a WebAssembly module.
 */
export const compileFunctions = (funcs: WasmFunction[]): Uint8Array => {
  const typeTable = new TypeTable();
  const functionTable = new FunctionTable();

  const importedFunctions: ImportedFunction[] = [];
  const compiledFunctions: CompiledFunction[] = [];
  const exportedFunctions: CompiledFunction[] = [];

  const remainingFuncs = [...funcs];
  while (remainingFuncs.length > 0) {
    const func = remainingFuncs.pop() as WasmFunction;
    if (func.kind === "import") {
      importedFunctions.push(func);
    } else if (func.kind === "compile") {
      compiledFunctions.push(func);

      if (func.isExported) {
        exportedFunctions.push(func);
      }
    } else if (func.kind === "inline") {
      throw new CompileInvariantError(
        `Attempt to compile inline function: ${func.name}`,
      );
    }
  }

  const typeSection = new Emitter();
  const importSection = new Emitter();
  const functionSection = new Emitter();
  const exportSection = new Emitter();
  const codeSection = new Emitter();

  importSection.emitListHeader(
    1 + funcs.filter((f) => f.kind === "import").length,
  );
  functionSection.emitListHeader(compiledFunctions.length);
  exportSection.emitListHeader(exportedFunctions.length);
  codeSection.emitListHeader(compiledFunctions.length);

  importSection.emitName(CORE_NAMESPACE);
  importSection.emitName(MEMORY_IMPORT_NAME);
  importSection.emitExternMemoryType(1);

  for (const func of importedFunctions) {
    functionTable.add(func.name);

    const funcTypeIndex = typeTable.addFunc(func.params, func.results);

    importSection.emitName(IMPORT_NAMESPACE);
    importSection.emitName(func.name);
    importSection.emitExternFunctionType(funcTypeIndex);
  }

  for (const func of compiledFunctions) {
    const funcTypeIndex = typeTable.addFunc(func.params, func.results);
    const funcIndex = func.isExported
      ? functionTable.addExported(func.name)
      : functionTable.add(func.name);

    functionSection.emitUint(funcTypeIndex);

    if (func.isExported) {
      exportSection.emitName(func.name);
      exportSection.emitExternFunctionType(funcIndex);
    }
  }

  typeSection.emitListHeader(typeTable.size);
  for (const type of typeTable) {
    if (type.definition.kind === "function") {
      typeSection.emitFunctionType(
        type.definition.params,
        type.definition.results,
      );
    } else {
      throw new Error(`Unknown type kind`);
    }
  }

  for (const func of compiledFunctions) {
    const body = func.compileBody(functionTable);
    codeSection.emitUint(body.byteLength);
    codeSection.appendBytes(body);
  }

  const module = new Emitter();

  for (const byte of MAGIC_WORD) module.emitByte(byte);
  for (const byte of VERSION_WORD) module.emitByte(byte);

  module.emitSection(SectionCode.type, typeSection.getOutput());
  module.emitSection(SectionCode.import, importSection.getOutput());
  module.emitSection(SectionCode.function, functionSection.getOutput());
  module.emitSection(SectionCode.export, exportSection.getOutput());
  module.emitSection(SectionCode.code, codeSection.getOutput());

  return module.getOutput();
};
