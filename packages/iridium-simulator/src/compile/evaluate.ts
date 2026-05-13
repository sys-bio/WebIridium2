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
} from "antimony-language/grammar";
import type { AntimonyModel } from "antimony-language/semantic";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { TIME_NAME } from "../names.ts";

// if they didn't have an assignment, give them this one
const DEFAULT_INITIAL_VALUE = 1;

export const evaluateInitialValues = (
  model: AntimonyModel,
): Map<string, number> => {
  const initialValues: Map<string, number> = new Map();
  const evalOrder = getEvaluationOrder(model, "set");

  // TODO: is this correct? what if simulation start time is different? relevant for assignment rules
  initialValues.set(TIME_NAME, 0);

  for (const name of evalOrder) {
    const evalVisitor = new AssignmentEvaluatorVisitor(initialValues);
    const variable = model.variables.get(name)!;

    if (variable.assignment) {
      if (
        variable.assignment.kind === "set" ||
        variable.assignment.kind === "rule"
      ) {
        initialValues.set(name, evalVisitor.visit(variable.assignment.formula));
      } else if (variable.assignment.kind === "rate") {
        initialValues.set(name, DEFAULT_INITIAL_VALUE);
      } else {
        throw new Error("Unknown variable assignment.");
      }
    } else {
      initialValues.set(name, DEFAULT_INITIAL_VALUE);
    }
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

  enterVariable(ctx: VariableContext): void {
    if (ctx.text !== TIME_NAME) {
      this.#variables.add(ctx.text);
    }
  }
}

// topological sort
export const getEvaluationOrder = (
  model: AntimonyModel,
  assignmentKind: "set" | "rule",
): string[] => {
  const graph: Record<string, Set<string>> = {};
  const inDegrees: Record<string, number> = {};

  for (const variable of model.variables.values()) {
    graph[variable.name] = new Set();
    inDegrees[variable.name] = 0;
  }

  for (const variable of model.variables.values()) {
    if (!variable.assignment) continue;

    if (variable.assignment.kind === assignmentKind) {
      const variableListener = new VariableGrabberListener();
      ParseTreeWalker.DEFAULT.walk(
        variableListener as ParseTreeListener,
        variable.assignment.formula,
      );

      for (const neighbor of variableListener.getVariables()) {
        inDegrees[variable.name] += 1;
        graph[neighbor].add(variable.name);
      }
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

  if (order.length !== model.variables.size) {
    throw new Error("Cycle detected in assignments.");
  }

  return order;
};
