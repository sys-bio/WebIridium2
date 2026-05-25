import { ValType, OpCode } from "./codes";
import Emitter, { createEmitLoadVariable } from "./Emitter";
import { IndexSymbolTable, LocalsSymbolTable } from "./SymbolTable";
import { getAssignmentOrder } from "./evaluate";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";
import { emitFormula } from "./formula";
import type { InternalModel } from "./model";
import { P_PARAM, T_PARAM, Y_PARAM } from "../names";
import type { AntimonyVariable } from "antimony-language/semantic";
import { CompileError } from "./errors";

const YDOT_PTR_PARAM = "ydot[]";

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
  const { variables, yVars, reactions, yTable, pTable } = model;
  const emitter = new Emitter();

  const floatingSpecies: AntimonyVariable[] = [];
  const odes: AntimonyVariable[] = [];
  for (const variable of yVars) {
    if (variable.kind === "species") {
      if (!variable.isConst) {
        floatingSpecies.push(variable);
      }
    } else {
      odes.push(variable);
    }
  }

  const ruleVariables = Array.from(model.variables.values()).filter(
    (v) => v.assignment?.kind === "rule",
  );
  const ruleMap = new Map(
    ruleVariables.map((v) => [v.name, v.assignment!.formula]),
  );
  const ruleEvaluationOrder = getAssignmentOrder(ruleMap);

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    YDOT_PTR_PARAM,
    P_PARAM,
  ]);

  for (const reaction of reactions) {
    localsTable.addLocal(reaction.name);
  }

  // we only have one type of local: f64
  emitter.emitListHeader(1);

  // specify that we want these many f64s
  emitter.emitUint32(reactions.length);
  emitter.emitByte(ValType.f64);

  const emitLoadVariable = createEmitLoadVariable(model, localsTable);

  // calculate rules

  for (const variableName of ruleEvaluationOrder) {
    const variable = variables.get(variableName)!;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(P_PARAM));

    emitFormula(
      variable.assignment!.formula,
      emitter,
      emitLoadVariable,
      functionTable,
    );

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(MEM_ALIGNMENT);
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
      if (f.assignment?.kind === "rate") {
        throw new CompileError(
          "Species cannot simultaneously be defined by rate rule and reaction.",
          { tree: f.assignment.formula },
        );
      } else if (ruleMap.has(f.name)) {
        throw new CompileError(
          "Species cannot simultaneously be defined by assignment rule and reaction.",
          { tree: f.assignment!.formula },
        );
      }

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

      if (isFirst) {
        // This will happen if the species was only involved in one reaction and that
        // reaction had stoichiometry of 0
        emitter.emitByte(OpCode.f64const);
        emitter.emitFloat64(0);
      }
    } else {
      // set to 0
      emitter.emitByte(OpCode.f64const);
      emitter.emitFloat64(0);
    }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(MEM_ALIGNMENT);
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
    emitter.emitUint32(MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_DOUBLE * yTable.get(ode.name));
  }

  // add to reactions to p (for output)
  for (const reaction of reactions) {
    const index = pTable.get(reaction.name);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getLocal(reaction.name));

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint32(MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_DOUBLE * index);
  }

  // return success
  emitter.emitByte(OpCode.i32const);
  emitter.emitUint32(0);

  emitter.emitByte(OpCode.end);

  return emitter;
};
