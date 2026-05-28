import { deriveModelsFromParseTree } from "antimony-language/semantic";
import Emitter from "./Emitter";
import { MAGIC_WORD, SectionCode, VERSION_WORD } from "./codes";
import { IndexSymbolTable } from "./SymbolTable";
import { TypeTable } from "./wasmTypes";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import type { EventSpec, ModelSpec } from "../modelSpec";
import { evaluateInitialValues } from "./evaluate";
import { parse } from "antimony-language/parse";
import {
  type AntimonyListener,
  type FunctionCallContext,
  type PowerContext,
} from "antimony-language/grammar";
import { type ParserRuleContext } from "antlr4ts";
import {
  CORE_NAMESPACE,
  IMPORT_NAMESPACE,
  MEMORY_IMPORT_NAME,
  RHS_NAME,
} from "../names";
import { compileRhs, RHS_PARAMS, RHS_RESULTS } from "./rhs";
import { createInternalModel, type InternalModel } from "./model";
import { compileEvents } from "./event";
import {
  builtinFunctions,
  POW_RESERVED_NAME,
  type CompiledFunction,
  type ImportedFunction,
  type WasmFunction,
} from "./functions";
import { CompileInvariantError, CompileModelError } from "./errors";

/** Used for testing. */
export const compileIntermediate = (
  code: string,
): {
  model: InternalModel;
  imports: string[];
  eventSpecs: EventSpec[];
  bytecode: Uint8Array;
} => {
  const root = parse(code);
  const internalModel = createInternalModel(deriveModelsFromParseTree(root));
  const referencedFunctions = Array.from(getReferencedFunctions(root));

  const functions: WasmFunction[] = [
    {
      kind: "compile",
      isExported: true,
      name: RHS_NAME,
      params: RHS_PARAMS,
      results: RHS_RESULTS,
      compileBody: (functionTable: IndexSymbolTable) =>
        compileRhs(functionTable, internalModel).getOutput(),
    },
    ...referencedFunctions.map((name) => {
      if (Object.hasOwn(builtinFunctions, name)) {
        return builtinFunctions[name];
      } else {
        throw new CompileModelError(`Unbound function: ${name}`);
      }
    }),
  ];

  let eventSpecs: EventSpec[] = [];
  if (internalModel.events.length > 0) {
    const eventsResult = compileEvents(internalModel);
    functions.push(...eventsResult.functions);
    eventSpecs = eventsResult.eventSpecs;
  }

  return {
    model: internalModel,
    imports: referencedFunctions,
    eventSpecs,
    bytecode: compileFunctions(functions),
  };
};

export const compile = async (code: string): Promise<ModelSpec> => {
  const { model, imports, eventSpecs, bytecode } = compileIntermediate(code);

  const initialValues = evaluateInitialValues(model);

  return {
    y: model.yVars.map((y) => {
      if (y.kind === "species") {
        return {
          kind: "floating",
          name: y.name,
          initialValue: initialValues.get(y.name),
        };
      } else {
        return {
          kind: y.kind,
          name: y.name,
          initialValue: initialValues.get(y.name),
        };
      }
    }),
    p: model.pVars.map((p) => {
      if (p.kind === "species") {
        return {
          kind: p.isConst ? "boundary" : "floating",
          name: p.name,
          initialValue: initialValues.get(p.name),
        };
      } else {
        return {
          kind: p.kind,
          name: p.name,
          initialValue: initialValues.get(p.name),
        };
      }
    }),
    reactions: model.reactions.map((r) => r.name),
    events: eventSpecs,
    wasmModule: await WebAssembly.compile(bytecode),
    funcImports: imports,
  };
};

const getReferencedFunctions = (context: ParserRuleContext): Set<string> => {
  const referenced = new Set<string>();
  const listener = new GetReferencedListener(referenced);
  ParseTreeWalker.DEFAULT.walk(listener as ParseTreeListener, context);
  return referenced;
};

class GetReferencedListener implements AntimonyListener {
  #referenced: Set<string>;

  constructor(imported: Set<string>) {
    this.#referenced = imported;
  }

  enterFunctionCall(ctx: FunctionCallContext): void {
    const name = ctx.NAME().text;
    if (
      Object.hasOwn(builtinFunctions, name) &&
      builtinFunctions[name].kind !== "inline"
    ) {
      this.#referenced.add(name);
    }
  }

  enterPower(_ctx: PowerContext): void {
    this.#referenced.add(POW_RESERVED_NAME);
  }
}

/** Compiles a list of functions into a WebAssembly module. */
export const compileFunctions = (funcs: WasmFunction[]): Uint8Array => {
  const typeTable = new TypeTable();
  const functionTable = new IndexSymbolTable();

  const importedFunctions: ImportedFunction[] = [];
  const compiledFunctions: CompiledFunction[] = [];
  const exportedFunctions: CompiledFunction[] = [];
  for (const func of funcs) {
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
    const funcIndex = functionTable.add(func.name);

    functionSection.emitUint32(funcTypeIndex);

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
    codeSection.emitUint32(body.byteLength);
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
