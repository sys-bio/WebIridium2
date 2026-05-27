// TOOD: write tests for this

import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import {
  type AntimonyListener,
  VariableContext,
  type AntimonyVisitor,
  LogicalContext,
  FormulaContext,
  CompareContext,
  SumContext,
  ProductContext,
  PositiveContext,
  NegativeContext,
  FunctionCallContext,
  ConstantContext,
  NameContext,
  SubvariableContext,
  PowerContext,
  NumberContext,
  VarContext,
} from "antimony-language/grammar";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { TIME_NAME } from "../names.ts";
import type { InternalModel } from "./model.ts";
import { CompileModelError } from "./errors.ts";
import { getVariableName } from "./formula.ts";

// if they didn't have an assignment, give them this one
const DEFAULT_INITIAL_VALUE = 1;

/**
 * Evaluates the initial values of a model in a topological order, setting default
 * values for any variables without any assignment.
 *
 * @throws CompileError - when there is a cycle in the assignments
 * @param model - the model to evaluate the initial values of
 * @returns map of variable names to their initial values
 */
export const evaluateInitialValues = (
  model: InternalModel,
): Map<string, number> => {
  const initialValues: Map<string, number> = new Map();
  const evalOrder = getAssignmentOrder(
    new Map(
      Array.from(model.variables.values()).filter(v => v.assignment?.kind !== "rule").map((v) => [
        v.name,
        v.assignment?.kind !== "rule" ? v.assignment?.initial : undefined,
      ]),
    ),
  );

  // TODO: is this correct? what if simulation start time is different? relevant for assignment rules
  // UPDATE(05-26-2026): I think this should be fine because even when you set the initial time, the simulation
  //                     should still start at 0. No other reasonable behavior imo.
  initialValues.set(TIME_NAME, 0);

  for (const name of evalOrder) {
    const evalVisitor = new AssignmentEvaluatorVisitor(initialValues);
    const variable = model.variables.get(name)!;

    if (variable?.assignment?.kind === "rule") continue;

    initialValues.set(
      name,
      variable.assignment?.initial?.accept(evalVisitor) ?? DEFAULT_INITIAL_VALUE,
    );
  }

  return initialValues;
};

class AssignmentEvaluatorVisitor
  extends AbstractParseTreeVisitor<number>
  implements AntimonyVisitor<number>
{
  #variables: Map<string, number>;

  constructor(variables: Map<string, number>) {
    super();
    this.#variables = variables;
  }

  defaultResult(): number {
    return DEFAULT_INITIAL_VALUE;
  }

  visitLogical(ctx: LogicalContext): number {
    if (ctx._op.text === "&&") {
      return (
        super.visit(ctx.getChild(0, FormulaContext)) &&
        super.visit(ctx.getChild(1, FormulaContext))
      );
    } else if (ctx._op.text === "||") {
      return (
        super.visit(ctx.getChild(0, FormulaContext)) ||
        super.visit(ctx.getChild(1, FormulaContext))
      );
    } else {
      throw new Error(`Unknown logical operator: ${ctx._op.text}`);
    }
  }

  visitCompare(ctx: CompareContext): number {
    let wasTrue = false;
    if (ctx._op.text === ">=") {
      wasTrue =
        super.visit(ctx.getChild(0, FormulaContext)) >=
        super.visit(ctx.getChild(1, FormulaContext));
    } else if (ctx._op.text === "<=") {
      wasTrue =
        super.visit(ctx.getChild(0, FormulaContext)) <=
        super.visit(ctx.getChild(1, FormulaContext));
    } else if (ctx._op.text === ">") {
      wasTrue =
        super.visit(ctx.getChild(0, FormulaContext)) >
        super.visit(ctx.getChild(1, FormulaContext));
    } else if (ctx._op.text === "<") {
      wasTrue =
        super.visit(ctx.getChild(0, FormulaContext)) <
        super.visit(ctx.getChild(1, FormulaContext));
    } else if (ctx._op.text === "==") {
      wasTrue =
        super.visit(ctx.getChild(0, FormulaContext)) ==
        super.visit(ctx.getChild(1, FormulaContext));
    } else {
      throw new Error(`Unknown comparison operator: ${ctx._op.text}`);
    }

    return wasTrue ? 1 : 0;
  }

  visitSum(ctx: SumContext): number {
    if (ctx._op.text === "+") {
      return (
        super.visit(ctx.getChild(0, FormulaContext)) +
        super.visit(ctx.getChild(1, FormulaContext))
      );
    } else if (ctx._op.text === "-") {
      return (
        super.visit(ctx.getChild(0, FormulaContext)) -
        super.visit(ctx.getChild(1, FormulaContext))
      );
    } else {
      throw new Error(`Unknown operator: ${ctx._op.text}`);
    }
  }

  visitProduct(ctx: ProductContext): number {
    if (ctx._op.text === "*") {
      return (
        super.visit(ctx.getChild(0, FormulaContext)) *
        super.visit(ctx.getChild(1, FormulaContext))
      );
    } else if (ctx._op.text === "/") {
      return (
        super.visit(ctx.getChild(0, FormulaContext)) /
        super.visit(ctx.getChild(1, FormulaContext))
      );
    } else if (ctx._op.text === "%") {
      // TODO: does this behave how we want for negatives?
      return (
        super.visit(ctx.getChild(0, FormulaContext)) %
        super.visit(ctx.getChild(1, FormulaContext))
      );
    } else {
      throw new Error(`Unknown operator: ${ctx._op.text}`);
    }
  }

  visitPower(ctx: PowerContext): number {
    return (
      super.visit(ctx.getChild(0, FormulaContext)) **
      super.visit(ctx.getChild(1, FormulaContext))
    );
  }

  visitNegative(ctx: NegativeContext): number {
    return -super.visit(ctx.getChild(0, FormulaContext));
  }

  visitPositive(ctx: PositiveContext): number {
    return super.visit(ctx.getChild(0, FormulaContext));
  }

  visitFunctionCall(_ctx: FunctionCallContext): number {
    throw new Error("Function calls not yet implemented.");
  }

  visitConstant(ctx: ConstantContext): number {
    return super.visit(ctx.variable());
  }

  visitSubvariable(ctx: SubvariableContext): number {
    return super.visit(ctx.variable());
  }

  visitName(ctx: NameContext): number {
    return this.#variables.get(ctx.NAME().text) as number;
  }

  visitNumber(ctx: NumberContext): number {
    return Number(ctx.NUMBER().text);
  }
}

class VariableGrabberListener implements AntimonyListener {
  #variables: Set<string>;

  constructor() {
    this.#variables = new Set<string>();
  }

  getVariables(): Set<string> {
    return this.#variables;
  }

  enterVar(ctx: VarContext): void {
    if (ctx.text !== TIME_NAME) {
      this.#variables.add(getVariableName(ctx.variable()));
    }
  }
}

/**
 * Returns toplogically sorted evaluation for assignments. Assignments are represented
 * by a map of names to (optional) formulas. If the formula for a variable is undefined,
 * it is assumed to be default initialized and listed first. Formulas may also contain variables
 * not listed in the assignments. In that case, these variables are assumed to already have a value
 * and not listed in the output.
 *
 * @throws CompileError - if there is a cycle in the assignments
 * @param assignments - map of variable names to (optional) assignment formulas
 * @returns toplogically sorted assignment ordering
 */
export const getAssignmentOrder = (
  assignments: Map<string, FormulaContext | undefined>,
): string[] => {
  const graph: Record<string, Set<string>> = {};
  const inDegrees: Record<string, number> = {};

  for (const variable of assignments.keys()) {
    graph[variable] = new Set();
    inDegrees[variable] = 0;
  }

  for (const [name, assignment] of assignments) {
    if (!assignment) continue;

    const variableListener = new VariableGrabberListener();
    ParseTreeWalker.DEFAULT.walk(
      variableListener as ParseTreeListener,
      assignment,
    );

    for (const neighbor of variableListener.getVariables()) {
      if (Object.hasOwn(graph, neighbor)) {
        inDegrees[name] += 1;
        graph[neighbor].add(name);
      } // otherwise we assume it already has an assignment
    }
  }

  const queue: string[] = [];
  for (const [variable, inDegree] of Object.entries(inDegrees)) {
    if (inDegree === 0) {
      queue.push(variable);
    }
  }

  const order: string[] = [];

  let variable: string | undefined;
  while ((variable = queue.shift())) {
    order.push(variable);
    for (const neighbor of graph[variable]) {
      inDegrees[neighbor] -= 1;

      if (inDegrees[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length !== assignments.size) {
    throw new CompileModelError("Cycle detected in assignments.");
  }

  return order;
};
