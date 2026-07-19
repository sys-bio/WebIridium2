// TOOD: write tests for this

import { TIME_NAME } from "../names.ts";
import {
  CompileInvariantError,
  CompileModelError,
  EvaluationError,
} from "./errors.ts";
import { builtinConstants } from "antimony-language/semantic/builtins";
import type { Compilation } from "./Compilation.ts";
import {
  visitExpression,
  walkExpression,
  type IridiumExpression,
  type IridiumExpressionListener,
  type IridiumExpressionVisitor,
} from "../ir/ast.ts";

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
  const assignments = new Map<string, IridiumExpression>();
  for (const species of compilation.species.values()) {
    assignments.set(species.name, species.initial);
  }
  for (const parameter of compilation.parameters.values()) {
    if (parameter.value.kind === "initial" || parameter.value.kind === "rate") {
      assignments.set(parameter.name, parameter.value.initial);
    } else if (parameter.value.kind === "assignment") {
      assignments.set(parameter.name, parameter.value.assignment);
    }
  }
  const evalOrder = getAssignmentOrder(assignments);

  // TODO: is this correct? what if simulation start time is different? relevant for assignment rules
  // UPDATE(05-26-2026): I think this should be fine because even when you set the initial time, the simulation
  //                     should still start at 0. No other reasonable behavior imo.
  initialValues.set(TIME_NAME, 0);

  for (const name of evalOrder) {
    const species = compilation.species.get(name);
    if (species) {
      const value = evaluateExpression(initialValues, species.initial);
      initialValues.set(name, value);
      outputInitialValues.set(name, value);
      continue;
    }

    const parameter = compilation.parameters.get(name);
    if (parameter) {
      if (
        parameter.value.kind === "initial" ||
        parameter.value.kind === "rate"
      ) {
        const value = evaluateExpression(
          initialValues,
          parameter.value.initial,
        );
        initialValues.set(name, value);
        outputInitialValues.set(name, value);
        assignments.set(parameter.name, parameter.value.initial);
      } else if (parameter.value.kind === "assignment") {
        initialValues.set(
          name,
          evaluateExpression(initialValues, parameter.value.assignment),
        );
      }
    }
  }

  return outputInitialValues;
};

const evaluateExpression = (
  variables: Map<string, number>,
  expression: IridiumExpression,
): number => {
  const evaluteVisitor: IridiumExpressionVisitor<number> = {
    visitNumber: ({ value }) => value,
    visitVariable: ({ name, metadata }) => {
      if (Object.hasOwn(builtinConstants, name)) {
        return builtinConstants[name].value;
      }

      if (!variables.has(name)) {
        throw new EvaluationError(`Unbound name: ${name}`, metadata);
      }
      return variables.get(name)!;
    },
    visitBinary: ({ op, left, right }) => {
      switch (op) {
        case "add":
          return (
            visitExpression(left, evaluteVisitor) +
            visitExpression(right, evaluteVisitor)
          );
        case "sub":
          return (
            visitExpression(left, evaluteVisitor) -
            visitExpression(right, evaluteVisitor)
          );
        case "mul":
          return (
            visitExpression(left, evaluteVisitor) *
            visitExpression(right, evaluteVisitor)
          );
        case "div":
          return (
            visitExpression(left, evaluteVisitor) /
            visitExpression(right, evaluteVisitor)
          );
        case "mod":
          // TODO: is this correct behavior?
          return (
            visitExpression(left, evaluteVisitor) %
            visitExpression(right, evaluteVisitor)
          );
        case "pow":
          return (
            visitExpression(left, evaluteVisitor) **
            visitExpression(right, evaluteVisitor)
          );
        case "and":
          return (
            visitExpression(left, evaluteVisitor) &&
            visitExpression(right, evaluteVisitor)
          );
        case "or":
          return (
            visitExpression(left, evaluteVisitor) ||
            visitExpression(right, evaluteVisitor)
          );
        case "eq":
          return visitExpression(left, evaluteVisitor) ==
            visitExpression(right, evaluteVisitor)
            ? 1
            : 0;
        case "neq":
          return visitExpression(left, evaluteVisitor) !=
            visitExpression(right, evaluteVisitor)
            ? 1
            : 0;
        case "le":
          return visitExpression(left, evaluteVisitor) <=
            visitExpression(right, evaluteVisitor)
            ? 1
            : 0;
        case "lt":
          return visitExpression(left, evaluteVisitor) <
            visitExpression(right, evaluteVisitor)
            ? 1
            : 0;
        case "ge":
          return visitExpression(left, evaluteVisitor) >=
            visitExpression(right, evaluteVisitor)
            ? 1
            : 0;
        case "gt":
          return visitExpression(left, evaluteVisitor) >
            visitExpression(right, evaluteVisitor)
            ? 1
            : 0;
      }
    },
    visitUnary: ({ op, expr }) => {
      switch (op) {
        case "neg":
          return -visitExpression(expr, evaluteVisitor);
        case "not":
          return Number(!visitExpression(expr, evaluteVisitor));
      }
    },
    visitCall: () => {
      throw new CompileInvariantError(
        "Calls not yet supported in interpreter.",
      );
    },
  };

  return visitExpression(expression, evaluteVisitor);
};

const getReferencedVariables = (expression: IridiumExpression): Set<string> => {
  const referenced = new Set<string>();
  const listener: IridiumExpressionListener = {
    afterVariable: ({ name }) => referenced.add(name),
  };
  walkExpression(expression, listener);
  return referenced;
};

/**
 * Returns toplogically sorted evaluation for assignments. Assignments are represented
 * by a map of names to (optional) expressions.Expressions may also contain variables
 * not listed in the assignments. In that case, these variables are assumed to already
 * have a value and not listed in the output.
 *
 * @throws CompileError - if there is a cycle in the assignments
 * @param assignments - map of variable names to (optional) assignment expressions
 * @returns toplogically sorted assignment ordering
 */
export const getAssignmentOrder = (
  assignments: Map<string, IridiumExpression>,
  { allowSelfCycle = false } = {},
): string[] => {
  const graph: Record<string, Set<string>> = {};
  const inDegrees: Record<string, number> = {};

  for (const variable of assignments.keys()) {
    graph[variable] = new Set();
    inDegrees[variable] = 0;
  }

  for (const [name, assignment] of assignments) {
    for (const neighbor of getReferencedVariables(assignment)) {
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
    // TODO: add more specific error for where the cycle occurred?
    throw new CompileModelError("Cycle detected in assignments.");
  }

  return order;
};
