import { parse } from "antimony-language/parse";
import {
  deriveModelsFromParseTree,
  type AntimonyModel,
} from "antimony-language/semantic";
import Emitter from "./Emitter";
import {
  MAGIC_WORD,
  OpCode,
  SectionCode,
  VERSION_WORD,
  ValType,
} from "./codes";
import { LocalsSymbolTable, IndexSymbolTable } from "./SymbolTable";
import { TypeTable } from "./wasmTypes";
import { FormulaCompilerListener } from "./FormulaCompilerListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import type {
  BoundarySpeciesSpec,
  FloatingSpeciesSpec,
  ModelSpec,
  ParameterSpec,
} from "../modelSpec";
import { evaluateInitialValues, getEvaluationOrder } from "./evaluate";
import { builtinFunctions, POW_RESERVED_NAME } from "./builtinImports";
import type {
  AntimonyListener,
  FormulaContext,
  FunctionCallContext,
  PowerContext,
} from "antimony-language/grammar";
import { type ParserRuleContext } from "antlr4ts";
import {
  CORE_NAMESPACE,
  IMPORT_NAMESPACE,
  MEMORY_IMPORT_NAME,
  RHS_NAME,
  TIME_NAME,
} from "../names";

const SIZEOF_DOUBLE = 8;
const DOUBLE_MEM_ALIGNMENT = 0; // TODO: what's a good number for this?

/** Used for testing. */
export const compileIntermediate = (
  code: string,
): {
  models: AntimonyModel[];
  imports: string[];
  bytecode: Uint8Array;
} => {
  const root = parse(code);
  const models = deriveModelsFromParseTree(root);
  const imports = Array.from(getImportedFunctions(root));

  return {
    models,
    imports,
    bytecode: compileModels(models, imports),
  };
};

export const compile = async (code: string): Promise<ModelSpec> => {
  const { models, imports, bytecode } = compileIntermediate(code);

  // TODO: get the main model properly
  const mainModel = models[0];

  const initialValues = evaluateInitialValues(mainModel);
  const floatingSpecies: FloatingSpeciesSpec[] = [];
  const boundarySpecies: BoundarySpeciesSpec[] = [];
  const parameters: ParameterSpec[] = [];

  for (const variable of mainModel.variables.values()) {
    if (variable.kind === "species") {
      if (variable.isConst) {
        boundarySpecies.push({
          name: variable.name,
          initialValue: initialValues.get(variable.name) as number,
        });
      } else {
        floatingSpecies.push({
          name: variable.name,
          initialValue: initialValues.get(variable.name) as number,
        });
      }
    } else if (variable.kind === "parameter") {
      parameters.push({
        name: variable.name,
        initialValue: initialValues.get(variable.name) as number,
      });
    } else {
      throw new Error(`Unknown variable kind`);
    }
  }

  return {
    floatingSpecies,
    boundarySpecies,
    parameters,
    reactions: Array.from(mainModel.reactions.keys()),
    rhsModule: await WebAssembly.compile(bytecode),
    funcImports: imports,
  };
};

const compileModels = (
  models: AntimonyModel[],
  imports: string[],
): Uint8Array => {
  // TODO: get mainModel properly?
  const mainModel = models[0];
  return compileFunctions([
    {
      kind: "compile",
      isExported: true,
      name: RHS_NAME,
      params: RHS_PARAMS,
      results: RHS_RESULTS,
      compileBody: (functionTable: IndexSymbolTable) =>
        compileRhs(functionTable, mainModel).getOutput(),
    },
    ...imports.map((name) => ({
      kind: "import" as const,
      name: name,
    })),
  ]);
};

const getImportedFunctions = (context: ParserRuleContext): Set<string> => {
  const imported = new Set<string>();
  const listener = new GetImportedListener(imported);
  ParseTreeWalker.DEFAULT.walk(listener as ParseTreeListener, context);
  return imported;
};

class GetImportedListener implements AntimonyListener {
  #imported: Set<string>;

  constructor(imported: Set<string>) {
    this.#imported = imported;
  }

  enterFunctionCall(ctx: FunctionCallContext): void {
    const name = ctx.NAME().text;
    if (Object.hasOwn(builtinFunctions, name)) {
      this.#imported.add(name);
    }
  }

  enterPower(_ctx: PowerContext): void {
    this.#imported.add(POW_RESERVED_NAME);
  }
}

export type ImportedFunction = {
  kind: "import";
  name: string;
};

export type CompiledFunction = {
  kind: "compile";
  isExported: boolean;
  name: string;
  params: ValType[];
  results: ValType[];
  compileBody: (functionTable: IndexSymbolTable) => Uint8Array;
};

export type WasmFunction = ImportedFunction | CompiledFunction;

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
    } else {
      compiledFunctions.push(func);
      if (func.isExported) {
        exportedFunctions.push(func);
      }
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

    const definition = builtinFunctions[func.name];
    const funcTypeIndex = typeTable.addFunc(
      definition.params,
      definition.results,
    );

    importSection.emitName(IMPORT_NAMESPACE);
    importSection.emitName(definition.name);
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

const T_PARAM = "t";
const Y_PTR_PARAM = "*y";
const YDOT_PTR_PARAM = "*yDot";
const P_PTR_PARAM = "*p";

const RHS_PARAMS: ValType[] = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const RHS_RESULTS: ValType[] = [ValType.i32];

const compileRhs = (
  functionTable: IndexSymbolTable,
  model: AntimonyModel,
): Emitter => {
  const emitter = new Emitter();

  const ruleEvaluationOrder = getEvaluationOrder(model, "rule").filter(
    (name) => model.variables.get(name)!.assignment?.kind === "rule",
  );

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PTR_PARAM,
    YDOT_PTR_PARAM,
    P_PTR_PARAM,
  ]);

  const floatingSpecies = Array.from(model.variables.values()).filter(
    (v) => v.kind === "species" && !v.isConst,
  );
  const boundarySpecies = Array.from(model.variables.values()).filter(
    (v) => v.kind === "species" && v.isConst,
  );
  const parameters = Array.from(model.variables.values()).filter(
    (v) => v.kind === "parameter",
  );

  const yTable = new IndexSymbolTable();
  for (const f of floatingSpecies) {
    yTable.add(f.name);
  }

  const pTable = new IndexSymbolTable();
  for (const b of boundarySpecies) {
    pTable.add(b.name);
  }
  for (const p of parameters) {
    pTable.add(p.name);
  }
  for (const name of model.reactions.keys()) {
    pTable.add(name);
  }

  for (const name of model.reactions.keys()) {
    localsTable.addLocal(name);
  }

  // we only have one type of local: f64
  emitter.emitListHeader(1);

  // specify that we want these many f64s
  emitter.emitUint32(model.reactions.size);
  emitter.emitByte(ValType.f64);

  const emitLoadVariable = (name: string): void => {
    if (name === TIME_NAME) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(T_PARAM));
    } else if (pTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(P_PTR_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * pTable.get(name));
    } else if (yTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(Y_PTR_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * yTable.get(name));
    } else {
      throw new Error(`Unbound name: ${name}`);
    }
  };

  const emitFormula = (formula: FormulaContext): void => {
    const formulaListener = new FormulaCompilerListener(
      emitter,
      emitLoadVariable,
      functionTable,
    );

    ParseTreeWalker.DEFAULT.walk(formulaListener as ParseTreeListener, formula);
  };

  // calculate rules

  for (const variableName of ruleEvaluationOrder) {
    const variable = model.variables.get(variableName)!;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(P_PTR_PARAM));

    emitFormula(variable.assignment!.formula);

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_DOUBLE * pTable.get(variableName));
  }

  // calculate all the reaction rates

  for (const [name, reaction] of model.reactions) {
    if (reaction.rate) {
      emitFormula(reaction.rate);

      emitter.emitByte(OpCode.localset);
      emitter.emitUint32(localsTable.getLocal(name));
    } else {
      // TODO: how to handle missing rate?
      emitter.emitByte(OpCode.f64const);
      emitter.emitUint32(0);

      emitter.emitByte(OpCode.localset);
      emitter.emitUint32(localsTable.getLocal(name));
    }
  }

  // assign to ydot

  const involvedReactions: Map<string, Map<string, number>> = new Map();

  for (const reaction of model.reactions.values()) {
    for (const reactant of reaction.reactants) {
      const reactantMap = involvedReactions.get(reactant.name);
      if (reactantMap) {
        reactantMap.set(reaction.name, -reactant.stoichiometry);
      } else {
        involvedReactions.set(
          reactant.name,
          new Map([[reaction.name, -reactant.stoichiometry]]),
        );
      }
    }

    for (const product of reaction.products) {
      const productMap = involvedReactions.get(product.name);
      if (productMap) {
        productMap.set(
          reaction.name,
          (productMap.get(reaction.name) ?? 0) + product.stoichiometry,
        );
      } else {
        involvedReactions.set(
          product.name,
          new Map([[reaction.name, product.stoichiometry]]),
        );
      }
    }
  }

  for (const f of floatingSpecies) {
    const reactions = involvedReactions.get(f.name);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(YDOT_PTR_PARAM));

    if (reactions) {
      let isFirst = true;
      for (const [reaction, stoichiometry] of reactions) {
        if (stoichiometry === 0) continue;

        emitter.emitByte(OpCode.localget);
        emitter.emitUint32(localsTable.getLocal(reaction));

        if (stoichiometry === -1) {
          emitter.emitByte(OpCode.f64neg);
        } else if (stoichiometry !== 1) {
          emitter.emitByte(OpCode.f64const);
          emitter.emitFloat64(stoichiometry);
          emitter.emitByte(OpCode.f64mul);
        }

        if (isFirst) {
          isFirst = false;
        } else {
          emitter.emitByte(OpCode.f64add);
        }
      }
    } else {
      // set to 0
      emitter.emitByte(OpCode.f64const);
      emitter.emitFloat64(0);
    }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_DOUBLE * yTable.get(f.name));
  }

  // add to reactions to p (for output)
  for (const name of model.reactions.keys()) {
    const index = pTable.get(name);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(P_PTR_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getLocal(name));

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_DOUBLE * index);
  }

  // return success
  emitter.emitByte(OpCode.i32const);
  emitter.emitUint32(0);

  emitter.emitByte(OpCode.end);

  return emitter;
};
