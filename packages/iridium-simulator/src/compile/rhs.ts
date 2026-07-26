import { ValType, OpCode } from "./codes";
import Emitter from "./Emitter";
import { FunctionTable, LocalsSymbolTable } from "./symbolTables.ts";
import { getAssignmentOrder } from "./evaluate";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";
import { EVENTS_PARAM, P_PARAM, T_PARAM, Y_PARAM } from "../names";
import type { Compilation } from "./Compilation.ts";
import { Scope } from "./Scope.ts";
import type { IridiumParameter, IridiumParameterValue } from "../ir/model.ts";
import { emitExpression } from "./expression.ts";

const YDOT_PTR_PARAM = "ydot[]";

export const RHS_PARAMS: ValType[] = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
export const RHS_RESULTS: ValType[] = [ValType.i32];

type RateDeterminedParameter = Omit<IridiumParameter, "value"> & {
  value: Extract<IridiumParameterValue, { kind: "rate" }>;
};
type AssignmentDeterminedParameter = Omit<IridiumParameter, "value"> & {
  value: Extract<IridiumParameterValue, { kind: "assignment" }>;
};

export const compileRhs = (
  compilation: Compilation,
  functionTable: FunctionTable,
): Emitter => {
  const { species, parameters, reactions, yTable, pTable } = compilation;
  const emitter = new Emitter();

  const rateDetermined: RateDeterminedParameter[] = Array.from(
    parameters.values(),
  ).filter((p): p is RateDeterminedParameter => p.value.kind === "rate");

  const assignmentDetermined: AssignmentDeterminedParameter[] = Array.from(
    parameters.values(),
  ).filter(
    (p): p is AssignmentDeterminedParameter => p.value.kind === "assignment",
  );

  const assignmentMap = new Map(
    assignmentDetermined.map((v) => [v.name, v.value.assignment]),
  );

  const assignmentEvaluationOrder = getAssignmentOrder(assignmentMap);

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    YDOT_PTR_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);

  for (const reaction of reactions.values()) {
    localsTable.addLocal(reaction.name);
  }

  const scope = new Scope(compilation, localsTable, functionTable);

  // we only have one type of local: f64
  emitter.emitListHeader(1);

  // specify that we want these many f64s
  emitter.emitUint(reactions.size);
  emitter.emitByte(ValType.f64);

  // calculate assignment rules

  for (const parameterName of assignmentEvaluationOrder) {
    const parameter = parameters.get(
      parameterName,
    ) as AssignmentDeterminedParameter;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitExpression(parameter.value.assignment, emitter, compilation, scope);

    // TODO: add back multiplying by compartment size for species
    // if (
    //   variable.kind === "species" &&
    //   !variable.hasSubstanceOnly &&
    //   variable.compartment
    // ) {
    //   scope.emitLoadVariableFromName(emitter, variable.compartment);
    //   emitter.emitUint(OpCode.f64mul);
    // }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_DOUBLE * pTable.get(parameterName));
  }

  // calculate all the reaction rates

  for (const reaction of reactions.values()) {
    emitExpression(reaction.rate, emitter, compilation, scope);

    emitter.emitByte(OpCode.localset);
    emitter.emitUint(localsTable.getLocal(reaction.name));
  }

  // assign to ydot

  const involvedReactions: Map<string, Map<string, number>> = new Map();

  for (const reaction of reactions.values()) {
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

  for (const speciesName of species.keys()) {
    const reactions = involvedReactions.get(speciesName);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(YDOT_PTR_PARAM));

    if (reactions) {
      let isFirst = true;
      for (const [reaction, stoichiometry] of reactions) {
        if (stoichiometry === 0) continue;

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(reaction));

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
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_DOUBLE * yTable.get(speciesName));
  }

  // do rate rules

  for (const parameter of rateDetermined) {
    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(YDOT_PTR_PARAM));

    emitExpression(parameter.value.rate, emitter, compilation, scope);

    // TODO: add back compartment product rule

    // if (ode.kind === "species" && !ode.hasSubstanceOnly && ode.compartment) {
    //   scope.emitLoadVariableFromName(emitter, ode.compartment);
    //   emitter.emitByte(OpCode.f64mul);
    //
    //   // TODO: cache compartment rate (sort compartments first, evaluate it first, instead of re-evaluating each time)
    //   // NOTE: We are failing to account for the scenario where the COMPARTMENT has an assignment rule since that would
    //   //       require differentiating the volume which is too complex of a task.
    //   const compartmentVariable = variables.get(ode.compartment)!;
    //   if (compartmentVariable.assignment?.kind === "rate") {
    //     // product rule second term
    //     scope.emitLoadVariableFromName(emitter, ode.name);
    //     emitFormula(
    //       compartmentVariable.assignment?.rate,
    //       emitter,
    //       compilation,
    //       scope,
    //     );
    //     emitter.emitByte(OpCode.f64mul);
    //     emitter.emitByte(OpCode.f64add);
    //   }
    // }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_DOUBLE * yTable.get(parameter.name));
  }

  // add to reactions to p (for output)
  for (const reaction of reactions.values()) {
    const index = pTable.get(reaction.name);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getLocal(reaction.name));

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_DOUBLE * index);
  }

  // return success
  emitter.emitI32ConstOp(0);

  emitter.emitByte(OpCode.end);

  return emitter;
};
