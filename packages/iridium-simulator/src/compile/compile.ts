import { deriveModelsFromParseTree } from "antimony-language/semantic";
import Emitter from "./Emitter";
import { MAGIC_WORD, SectionCode, VERSION_WORD, ValType } from "./codes";
import { IndexSymbolTable } from "./SymbolTable";
import { TypeTable } from "./wasmTypes";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import type { ModelSpec } from "../modelSpec";
import { evaluateInitialValues } from "./evaluate";
import { builtinFunctions, POW_RESERVED_NAME } from "./builtinImports";
import { parse } from "antimony-language/parse";
import type {
  AntimonyListener,
  FunctionCallContext,
  PowerContext,
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
import { compileEvents, type CompiledEvent } from "./event";

/** Used for testing. */
export const compileIntermediate = (
  code: string,
): {
  model: InternalModel;
  imports: string[];
  events: CompiledEvent[];
  bytecode: Uint8Array;
} => {
  const root = parse(code);
  const internalModel = createInternalModel(deriveModelsFromParseTree(root));
  const imports = Array.from(getImportedFunctions(root));

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
    ...imports.map((name) => ({
      kind: "import" as const,
      name: name,
    })),
  ];

  let events: CompiledEvent[] = [];
  if (internalModel.events.length > 0) {
    const { functions: eventFunctions, events: compiledEvents } =
      compileEvents(internalModel);
    functions.push(...eventFunctions);
    events = compiledEvents;
  }

  return {
    model: internalModel,
    imports,
    events,
    bytecode: compileFunctions(functions),
  };
};

export const compile = async (code: string): Promise<ModelSpec> => {
  const { model, imports, events, bytecode } = compileIntermediate(code);

  const initialValues = evaluateInitialValues(model);

  return {
    floatingSpecies: model.floatingSpecies.map((v) => ({
      name: v.name,
      initialValue: initialValues.get(v.name)!,
    })),
    odes: model.odes.map((v) => ({
      name: v.name,
      initialValue: initialValues.get(v.name)!,
    })),
    boundarySpecies: model.boundarySpecies.map((v) => ({
      name: v.name,
      initialValue: initialValues.get(v.name)!,
    })),
    parameters: model.parameters.map((v) => ({
      name: v.name,
      initialValue: initialValues.get(v.name)!,
    })),
    reactions: model.reactions.map((r) => r.name),
    events: events.map((e) => ({
      ...e,
      yIndices: e.yIndices.keys().map((y) => model.yTable.get(y)),
      pIndices: e.pIndices.keys().map((p) => model.pTable.get(p)),
    })),
    wasmModule: await WebAssembly.compile(bytecode),
    funcImports: imports,
  };
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
