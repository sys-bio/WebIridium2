// TOOD: write tests for this

import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import {
  type AntimonyListener,
  type AntimonyVisitor,
  LogicalContext,
  FormulaContext,
  CompareContext,
  SumContext,
  ProductContext,
  PositiveContext,
  NegativeContext,
  ConstantContext,
  PowerContext,
  NumberContext,
  VarContext,
  GroupContext,
  NameContext,
  NotContext,
  CallContext,
} from "antimony-language/grammar";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { TIME_NAME } from "../names.ts";
import {
  CompileInvariantError,
  CompileModelError,
  EvaluationError,
} from "./errors.ts";
import { builtinConstants } from "antimony-language/semantic/builtins";
import type { Compilation } from "./Compilation.ts";
import { getVariableName } from "./Scope.ts";

// if they didn't have an assignment, give them this one
// annoyingly, COPASI uses 1, RoadRunner uses 0
const DEFAULT_INITIAL_VALUE = 0;
const DEFAULT_COMPARTMENT_VALUE = 1;

/**
 * Evaluates the initial values of a model in a topological order, setting default
 * values for any variables without any assignment.
 *
 * @throws CompileError - when there is a cycle in the assignments
 * @param model - the model to evaluate the initial values of
 * @returns map of variable names to their initial values
 */
export const evaluateInitialValues = (
  compilation: Compilation,
): Map<string, number> => {
  const initialValues: Map<string, number> = new Map();
  const outputInitialValues: Map<string, number> = new Map();
  const evalOrder = getAssignmentOrder(
    new Map(
      Array.from(compilation.variables.values())
        .filter((v) => v.assignment?.kind !== "rule")
        .map((v) => [
          v.name,
          v.assignment?.kind === "rule"
            ? v.assignment.rule
            : v.assignment?.initial,
        ]),
    ),
  );

  // TODO: is this correct? what if simulation start time is different? relevant for assignment rules
  // UPDATE(05-26-2026): I think this should be fine because even when you set the initial time, the simulation
  //                     should still start at 0. No other reasonable behavior imo.
  initialValues.set(TIME_NAME, 0);

  const evalVisitor = new AssignmentEvaluatorVisitor(initialValues);
  for (const name of evalOrder) {
    const variable = compilation.variables.get(name)!;

    if (variable?.assignment?.kind === "rule") {
      // TODO: do we *really* want to base the initial value of rule variable on its assignment
      //       COPASI does this, so it shouldn't be completely wrong.
      initialValues.set(
        name,
        variable.assignment.rule.accept(evalVisitor) ??
          (variable.kind === "compartment"
            ? DEFAULT_COMPARTMENT_VALUE
            : DEFAULT_INITIAL_VALUE),
      );
    } else {
      const value =
        variable.assignment?.initial?.accept(evalVisitor) ??
        (variable.kind === "compartment"
          ? DEFAULT_COMPARTMENT_VALUE
          : DEFAULT_INITIAL_VALUE);

      initialValues.set(name, value);
      outputInitialValues.set(name, value);
    }
  }

  return outputInitialValues;
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
    throw new CompileModelError("All nodes must evaluate.");
  }

  visitLogical(ctx: LogicalContext): number {
    if (ctx._op.text === "&&") {
      return super.visit(ctx.formula(0)) && super.visit(ctx.formula(1));
    } else if (ctx._op.text === "||") {
      return super.visit(ctx.formula(0)) || super.visit(ctx.formula(1));
    } else {
      throw new CompileInvariantError(
        `Unknown logical operator: ${ctx._op.text}`,
      );
    }
  }

  visitCompare(ctx: CompareContext): number {
    let wasTrue = false;
    if (ctx._op.text === ">=") {
      wasTrue = super.visit(ctx.formula(0)) >= super.visit(ctx.formula(1));
    } else if (ctx._op.text === "<=") {
      wasTrue = super.visit(ctx.formula(0)) <= super.visit(ctx.formula(1));
    } else if (ctx._op.text === ">") {
      wasTrue = super.visit(ctx.formula(0)) > super.visit(ctx.formula(1));
    } else if (ctx._op.text === "<") {
      wasTrue = super.visit(ctx.formula(0)) < super.visit(ctx.formula(1));
    } else if (ctx._op.text === "==") {
      wasTrue = super.visit(ctx.formula(0)) == super.visit(ctx.formula(1));
    } else {
      throw new Error(`Unknown comparison operator: ${ctx._op.text}`);
    }

    return wasTrue ? 1 : 0;
  }

  visitSum(ctx: SumContext): number {
    if (ctx._op.text === "+") {
      return super.visit(ctx.formula(0)) + super.visit(ctx.formula(1));
    } else if (ctx._op.text === "-") {
      return super.visit(ctx.formula(0)) - super.visit(ctx.formula(1));
    } else {
      throw new Error(`Unknown operator: ${ctx._op.text}`);
    }
  }

  visitProduct(ctx: ProductContext): number {
    if (ctx._op.text === "*") {
      return super.visit(ctx.formula(0)) * super.visit(ctx.formula(1));
    } else if (ctx._op.text === "/") {
      return super.visit(ctx.formula(0)) / super.visit(ctx.formula(1));
    } else if (ctx._op.text === "%") {
      // TODO: does this behave how we want for negatives?
      return super.visit(ctx.formula(0)) % super.visit(ctx.formula(1));
    } else {
      throw new Error(`Unknown operator: ${ctx._op.text}`);
    }
  }

  visitGroup(ctx: GroupContext): number {
    return super.visit(ctx.formula());
  }

  visitPower(ctx: PowerContext): number {
    return super.visit(ctx.formula(0)) ** super.visit(ctx.formula(1));
  }

  visitNegative(ctx: NegativeContext): number {
    return -super.visit(ctx.formula());
  }

  // literally does nothing
  visitPositive(ctx: PositiveContext): number {
    return super.visit(ctx.formula());
  }

  visitNot(ctx: NotContext): number {
    return Number(!super.visit(ctx.formula()));
  }

  visitCall(_ctx: CallContext): number {
    // TODO: implement function calls
    throw new CompileModelError("Function calls not yet implemented.");
  }

  visitConstant(ctx: ConstantContext): number {
    return super.visit(ctx.variable());
  }

  visitVar(ctx: VarContext): number {
    const name = getVariableName(ctx.variable());
    if (Object.hasOwn(builtinConstants, name)) {
      return builtinConstants[name].value;
    }

    const got = this.#variables.get(name);
    if (got === undefined) {
      throw new EvaluationError(`Unbound name: ${name}`, { tree: ctx });
    }
    return got;
  }

  visitNumber(ctx: NumberContext): number {
    return Number(ctx.NUMBER().text);
  }
}

const INVALID_BOOLEAN_MESSAGE =
  "You can only use the values `true` or `false` here.";

/**
 * Evaluates a boolean formula.
 *
 * @throws if the formula is neither exactly `true` or `false`
 */
export const evaluateBoolean = (formula: FormulaContext): boolean => {
  if (formula.childCount !== 1) {
    throw new EvaluationError(INVALID_BOOLEAN_MESSAGE, { tree: formula });
  }

  const child = formula.getChild(0);
  if (!(child instanceof NameContext)) {
    throw new EvaluationError(INVALID_BOOLEAN_MESSAGE, { tree: formula });
  }

  if (child.text === "true") {
    return true;
  } else if (child.text === "false") {
    return false;
  } else {
    throw new EvaluationError(INVALID_BOOLEAN_MESSAGE, { tree: formula });
  }
};

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
  { allowSelfCycle = false } = {},
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
      if (allowSelfCycle && neighbor === name) continue;

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
