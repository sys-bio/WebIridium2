import { deriveModels, type AntimonyModel } from "antimony-language/semantic";
import Emitter from "./Emitter";
import {
  MAGIC_WORD,
  OpCode,
  SectionCode,
  VERSION_WORD,
  ValType,
} from "./codes";
import { LocalsSymbolTable, IndexSymbolTable } from "./SymbolTable";
import { FormulaCompilerListener } from "./FormulaCompilerListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

export const IMPORT_NAMESPACE = "iridium";
export const MEMORY_IMPORT_NAME = "mem";

const RHS_NAME = "rhs";

const SIZEOF_DOUBLE = 8;
const DOUBLE_MEM_ALIGNMENT = 0; // TODO: what's a good number for this?

export const compile = (code: string): Promise<WebAssembly.Module> => {
  return WebAssembly.instantiate(compileModelsToBytecode(deriveModels(code)));
};

export const compileModelsToBytecode = (
  models: AntimonyModel[],
): Uint8Array => {
  // TODO: get the main model properly
  const mainModel = models[0];

  const typeTable = new IndexSymbolTable();
  const typeSection = compileTypeSection(typeTable);

  const importSection = compileImportSection();

  const functionTable = new IndexSymbolTable();
  const functionSection = compileFunctionSection(functionTable, typeTable);

  const exportSection = compileExportSection(functionTable);

  const codeSection = compileCodeSection(mainModel);

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

const compileTypeSection = (typeTable: IndexSymbolTable): Emitter => {
  const emitter = new Emitter();

  typeTable.add(RHS_NAME);

  // we only have one type
  emitter.emitListHeader(1);

  emitter.emitFunctionType(
    [ValType.f64, ValType.i32, ValType.i32, ValType.i32],
    [ValType.i32],
  );

  return emitter;
};

const compileImportSection = (): Emitter => {
  const emitter = new Emitter();

  emitter.emitListHeader(1);

  // only one import right now - the memory
  emitter.emitName(IMPORT_NAMESPACE);
  emitter.emitName(MEMORY_IMPORT_NAME);
  emitter.emitExternMemoryType(1);

  return emitter;
};

const compileFunctionSection = (
  functionTable: IndexSymbolTable,
  typeTable: IndexSymbolTable,
): Emitter => {
  const emitter = new Emitter();

  functionTable.add(RHS_NAME);

  emitter.emitListHeader(1);
  emitter.emitUint32(typeTable.get(RHS_NAME));

  return emitter;
};

const compileExportSection = (functionTable: IndexSymbolTable): Emitter => {
  const emitter = new Emitter();

  emitter.emitListHeader(1);
  emitter.emitName(RHS_NAME);
  emitter.emitExternFunctionType(functionTable.get(RHS_NAME));

  return emitter;
};

const T_PARAM = "t";
const Y_PTR_PARAM = "*y";
const YDOT_PTR_PARAM = "*yDot";
const P_PTR_PARAM = "*p";

const compileRhs = (model: AntimonyModel): Emitter => {
  const emitter = new Emitter();

  const localTable = new LocalsSymbolTable([
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
    (v) => v.kind === "unknown" || v.kind === "parameter",
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
    localTable.addLocal(name);
  }

  // we only have one type of local: f64
  emitter.emitListHeader(1);

  // specify that we want these many f64s
  emitter.emitUint32(model.reactions.size);
  emitter.emitByte(ValType.f64);

  // calculate all the reaction rates

  const emitLoadVariable = (name: string): void => {
    if (pTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localTable.getParam(P_PTR_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * pTable.get(name)); // offset
    } else if (yTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localTable.getParam(Y_PTR_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * yTable.get(name)); // offset
    } else {
      throw new Error(`Unbound name: ${name}`);
    }
  };

  for (const [name, reaction] of model.reactions) {
    if (reaction.rate) {
      const formulaListener = new FormulaCompilerListener(
        emitter,
        emitLoadVariable,
      );
      ParseTreeWalker.DEFAULT.walk(
        formulaListener as ParseTreeListener,
        reaction.rate,
      );

      emitter.emitByte(OpCode.localset);
      emitter.emitUint32(localTable.getLocal(name));
    } else {
      // TODO: how to handle missing rate?
      emitter.emitByte(OpCode.f64const);
      emitter.emitUint32(0);

      emitter.emitByte(OpCode.localset);
      emitter.emitUint32(localTable.getLocal(name));
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
        productMap.set(reaction.name, product.stoichiometry);
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
    emitter.emitUint32(localTable.getParam(YDOT_PTR_PARAM));

    if (reactions) {
      let isFirst = true;
      for (const [reaction, stoichiometry] of reactions) {
        emitter.emitByte(OpCode.localget);
        emitter.emitUint32(localTable.getLocal(reaction));

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

  // return success
  emitter.emitByte(OpCode.i32const);
  emitter.emitUint32(0);

  emitter.emitByte(OpCode.end);

  return emitter;
};

const compileCodeSection = (model: AntimonyModel): Emitter => {
  const emitter = new Emitter();
  const rhsFunc = compileRhs(model).getOutput();
  emitter.emitListHeader(1);
  emitter.emitUint32(rhsFunc.byteLength);
  emitter.appendBytes(rhsFunc);
  return emitter;
};
