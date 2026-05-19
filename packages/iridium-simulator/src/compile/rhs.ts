import { TIME_NAME } from "../names";
import { ValType, OpCode } from "./codes";
import Emitter from "./Emitter";
import { IndexSymbolTable, LocalsSymbolTable } from "./SymbolTable";
import { getEvaluationOrder } from "./evaluate";
import { DOUBLE_MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";
import { emitFormula } from "./formula";
import type { InternalModel } from "./model";

const T_PARAM = "t";
const Y_PTR_PARAM = "*y";
const YDOT_PTR_PARAM = "*yDot";
const P_PTR_PARAM = "*p";

export const RHS_PARAMS: ValType[] = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
export const RHS_RESULTS: ValType[] = [ValType.i32];

export const compileRhs = (
  functionTable: IndexSymbolTable,
  model: InternalModel,
): Emitter => {
  const { variables, floatingSpecies, odes, reactions, yTable, pTable } = model;
  const emitter = new Emitter();

  const ruleEvaluationOrder = getEvaluationOrder(
    model.variables,
    "rule",
  ).filter((name) => variables.get(name)!.assignment?.kind === "rule");

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PTR_PARAM,
    YDOT_PTR_PARAM,
    P_PTR_PARAM,
  ]);

  for (const reaction of reactions) {
    localsTable.addLocal(reaction.name);
  }

  // we only have one type of local: f64
  emitter.emitListHeader(1);

  // specify that we want these many f64s
  emitter.emitUint32(reactions.length);
  emitter.emitByte(ValType.f64);

  const emitLoadVariable = (emitter: Emitter, name: string): void => {
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

  // calculate rules

  for (const variableName of ruleEvaluationOrder) {
    const variable = variables.get(variableName)!;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(P_PTR_PARAM));

    emitFormula(
      variable.assignment!.formula,
      emitter,
      emitLoadVariable,
      functionTable,
    );

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_DOUBLE * pTable.get(variableName));
  }

  // calculate all the reaction rates

  for (const reaction of reactions) {
    if (reaction.rate) {
      emitFormula(reaction.rate, emitter, emitLoadVariable, functionTable);

      emitter.emitByte(OpCode.localset);
      emitter.emitUint32(localsTable.getLocal(reaction.name));
    } else {
      // TODO: how to handle missing rate?
      emitter.emitByte(OpCode.f64const);
      emitter.emitUint32(0);

      emitter.emitByte(OpCode.localset);
      emitter.emitUint32(localsTable.getLocal(reaction.name));
    }
  }

  // assign to ydot

  const involvedReactions: Map<string, Map<string, number>> = new Map();

  for (const reaction of reactions) {
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

  // do rate rules
  for (const ode of odes) {
    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(YDOT_PTR_PARAM));

    emitFormula(
      ode.assignment!.formula,
      emitter,
      emitLoadVariable,
      functionTable,
    );

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_DOUBLE * yTable.get(ode.name));
  }

  // add to reactions to p (for output)
  for (const reaction of reactions) {
    const index = pTable.get(reaction.name);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(P_PTR_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getLocal(reaction.name));

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
