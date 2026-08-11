import { ValType, OpCode } from "./codes";
import Emitter from "./Emitter";
import { FunctionTable, LocalsSymbolTable } from "./symbolTables.ts";
import { getAssignmentOrder, tryEvaluateStoichiometry } from "./evaluate";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";
import { EVENTS_PARAM, P_PARAM, T_PARAM, Y_PARAM } from "../names";
import type { Compilation } from "./Compilation.ts";
import { Scope } from "./Scope.ts";
import type { IridiumVariable, IridiumVariableValue } from "../ir/model.ts";
import { emitExpression } from "./expression.ts";
import type { IridiumExpression } from "../ir/ast.ts";

const YDOT_PTR_PARAM = "ydot[]";

export const RHS_PARAMS: ValType[] = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
export const RHS_RESULTS: ValType[] = [ValType.i32];

type RateDeterminedVariable = Omit<IridiumVariable, "value"> & {
  value: Extract<IridiumVariableValue, { kind: "rate" }>;
};
type AssignmentDeterminedVariable = Omit<IridiumVariable, "value"> & {
  value: Extract<IridiumVariableValue, { kind: "assignment" }>;
};
type ReactionDeterminedVariable = Omit<IridiumVariable, "value"> & {
  value: Extract<IridiumVariableValue, { kind: "reaction" }>;
};

export const compileRhs = (
  compilation: Compilation,
  functionTable: FunctionTable,
): Emitter => {
  const { variables, compartments, reactions, yTable, pTable } = compilation;
  const emitter = new Emitter();

  const rateDetermined: RateDeterminedVariable[] = Array.from(
    variables.values(),
  ).filter((p): p is RateDeterminedVariable => p.value.kind === "rate");

  const assignmentDetermined: AssignmentDeterminedVariable[] = Array.from(
    variables.values(),
  ).filter(
    (p): p is AssignmentDeterminedVariable => p.value.kind === "assignment",
  );

  const reactionDetermined: ReactionDeterminedVariable[] = Array.from(
    variables.values(),
  ).filter((p): p is ReactionDeterminedVariable => p.value.kind === "reaction");

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

  for (const variableName of assignmentEvaluationOrder) {
    const variable = variables.get(
      variableName,
    ) as AssignmentDeterminedVariable;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitExpression(variable.value.assignment, emitter, compilation, scope);

    const compartment = compartments.get(variable.name);
    if (!variable.hasSubstanceOnly && compartment) {
      scope.emitLoadVariableFromName(emitter, compartment.name);
      emitter.emitUint(OpCode.f64mul);
    }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_DOUBLE * pTable.get(variableName));
  }

  // calculate all the reaction rates

  for (const reaction of reactions.values()) {
    emitExpression(reaction.rate, emitter, compilation, scope);

    emitter.emitByte(OpCode.localset);
    emitter.emitUint(localsTable.getLocal(reaction.name));
  }

  // assign to ydot

  const involvedReactions: Map<
    string,
    Map<string, IridiumExpression>
  > = new Map();

  const mergeMapWithAdd = (
    map: Map<string, IridiumExpression>,
    name: string,
    expr: IridiumExpression,
  ) => {
    if (map.has(name)) {
      map.set(name, {
        kind: "binary",
        op: "add",
        left: map.get(name)!,
        right: expr,
      });
    } else {
      map.set(name, expr);
    }
  };

  for (const reaction of reactions.values()) {
    for (const reactant of reaction.reactants) {
      const reactantMap = involvedReactions.get(reactant.name);
      const stoichExpr: IridiumExpression = {
        kind: "unary",
        op: "neg",
        expr: reactant.stoichiometry,
      };
      if (reactantMap) {
        mergeMapWithAdd(reactantMap, reaction.name, stoichExpr);
      } else {
        involvedReactions.set(
          reactant.name,
          new Map([[reaction.name, stoichExpr]]),
        );
      }
    }

    for (const product of reaction.products) {
      const productMap = involvedReactions.get(product.name);
      if (productMap) {
        mergeMapWithAdd(productMap, reaction.name, product.stoichiometry);
      } else {
        involvedReactions.set(
          product.name,
          new Map([[reaction.name, product.stoichiometry]]),
        );
      }
    }
  }

  for (const { name: variableName } of reactionDetermined) {
    const reactions = involvedReactions.get(variableName);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(YDOT_PTR_PARAM));

    if (reactions) {
      let isFirst = true;
      for (const [reaction, stoichExpr] of reactions) {
        const constStoich = tryEvaluateStoichiometry(stoichExpr);
        if (constStoich === 0) continue;

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(reaction));

        if (constStoich === null) {
          // can't be evaluated at compile-time, manually evaluate at runtime
          emitExpression(stoichExpr, emitter, compilation, scope);
          emitter.emitByte(OpCode.f64mul);
        } else {
          if (constStoich === -1) {
            emitter.emitByte(OpCode.f64neg);
          } else if (constStoich !== 1) {
            emitter.emitByte(OpCode.f64const);
            emitter.emitFloat64(constStoich);
            emitter.emitByte(OpCode.f64mul);
          }
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
    emitter.emitUint(SIZEOF_DOUBLE * yTable.get(variableName));
  }

  // do rate rules

  for (const variable of rateDetermined) {
    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(YDOT_PTR_PARAM));

    emitExpression(variable.value.rate, emitter, compilation, scope);

    const compartment = compartments.get(variable.name);
    if (!variable.hasSubstanceOnly && compartment) {
      scope.emitLoadVariableFromName(emitter, compartment.name);
      emitter.emitByte(OpCode.f64mul);

      // TODO: cache compartment rate (sort compartments first, evaluate it first, instead of re-evaluating each time)
      // NOTE: We are failing to account for the scenario where the COMPARTMENT has an assignment rule since that would
      //       require differentiating the volume which is too complex of a task.
      if (compartment.value.kind === "rate") {
        // product rule second term
        scope.emitLoadVariableFromName(emitter, variable.name);
        emitExpression(compartment.value.rate, emitter, compilation, scope);
        emitter.emitByte(OpCode.f64mul);
        emitter.emitByte(OpCode.f64add);
      }
    }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_DOUBLE * yTable.get(variable.name));
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
