import {
  walkExpression,
  type IridiumExpression,
  type IridiumExpressionListener,
} from "../ir/ast";
import { expr } from "../ir/dsl";
import type { IridiumVariable } from "../ir/model";
import type { Compilation } from "./Compilation";
import { CompileModelError } from "./errors";
import { tryEvaluateStoichiometry } from "./initialValues";
import type { IndexSymbolTable } from "./symbolTables";

type Index = number & { readonly __brand: unique symbol };

export type Assignable = {
  kind: "name" | "rate" | "algebraic";
  name: string;
};

export type Assignment =
  | {
      kind: "name" | "rate";
      name: string;
      expression: IridiumExpression;
    }
  | {
      kind: "algebraic";
      name: string;
      index: number;
      expression: IridiumExpression;
    };

// These tags are two-fold are used in the topo sort so that ydot/p assignments/algebraic rules go after y assignments
const P_TAG = 0x4000_0000;
const ALGEBRAIC_TAG = 0x8000_0000;

const asY = (index: number): Index => index as Index;
const asP = (index: number): Index => (index | P_TAG) as Index;
const asAlgebraic = (index: number): Index =>
  ((index | ALGEBRAIC_TAG) >>> 0) as Index; // need to add the >>> so its treated as unsigned

export class AssignmentGraph {
  #yTable: IndexSymbolTable;
  #pTable: IndexSymbolTable;
  #assignments: Map<Index, Assignment>;
  #algebraicRuleIndexes: Map<string, Index>;

  constructor(
    y: IndexSymbolTable,
    p: IndexSymbolTable,
    yAssignments: Map<string, IridiumExpression>,
    ydotAssignments: Map<string, IridiumExpression>,
    pAssignments: Map<string, IridiumExpression>,
    algebraicRules: Map<string, IridiumExpression>,
  ) {
    this.#yTable = y;
    this.#pTable = p;
    this.#assignments = new Map();
    this.#algebraicRuleIndexes = new Map();

    const yNames = y.keys();
    for (let i = 0; i < yNames.length; i++) {
      const name = yNames[i];

      const yAssignment = yAssignments.get(name);
      if (yAssignment) {
        this.#assignments.set(asY(i), {
          kind: "name",
          name,
          expression: yAssignment,
        });
      }

      const ydotAssignment = ydotAssignments.get(name);
      if (ydotAssignment) {
        const index = asP(this.#pTable.get(name));
        this.#assignments.set(index, {
          kind: "rate",
          name,
          expression: ydotAssignment,
        });
      }
    }

    const pNames = p.keys();
    for (let i = 0; i < pNames.length; i++) {
      const name = pNames[i];
      const pAssignment = pAssignments.get(name);
      if (pAssignment) {
        this.#assignments.set(asP(i), {
          kind: "name",
          name,
          expression: pAssignment,
        });
      }
    }

    const algebraicRuleNames = Array.from(algebraicRules.keys());
    for (let i = 0; i < algebraicRuleNames.length; i++) {
      const name = algebraicRuleNames[i];
      const expression = algebraicRules.get(name)!;
      this.#assignments.set(asAlgebraic(i), {
        kind: "algebraic",
        name,
        index: i,
        expression,
      });
      this.#algebraicRuleIndexes.set(name, asAlgebraic(i));
    }
  }

  #assignmentToIndex(assignment: Assignable): Index {
    switch (assignment.kind) {
      case "name":
        if (this.#yTable.has(assignment.name)) {
          return asY(this.#yTable.get(assignment.name));
        } else {
          return asP(this.#pTable.get(assignment.name));
        }
      case "rate":
        return asP(this.#pTable.get(assignment.name));
      case "algebraic":
        return this.#algebraicRuleIndexes.get(assignment.name)!;
    }
  }

  #indexToAssignment(index: Index): Assignment {
    return this.#assignments.get(index)!;
  }

  getAssignmentOrder(assignments: Assignable[]): Assignment[] {
    const graph: Map<Index, Index[]> = new Map();
    const inDegrees: Map<Index, number> = new Map();

    const stack = assignments.map((assignment) =>
      this.#assignmentToIndex(assignment),
    );

    // collect dependencies into a graph

    while (true) {
      const got = stack.pop();
      if (got === undefined) break;
      if (inDegrees.has(got)) continue;

      const assignment = this.#assignments.get(got);
      // Not included in the assignment graph.
      // Could be the value of a y-variable.
      if (!assignment) continue;

      const referenced = this.#getReferenced(assignment.expression).filter(
        (idx) => this.#assignments.has(idx),
      );
      stack.push(...referenced);
      inDegrees.set(got, referenced.length);

      for (const neighbor of referenced) {
        const neighborIndices = graph.get(neighbor);
        if (neighborIndices) {
          neighborIndices.push(got);
        } else {
          graph.set(neighbor, [got]);
        }
      }
    }

    // topo sort the graph and use index as secondary ordering

    const heap: Index[] = [];
    for (const [index, inDegree] of inDegrees) {
      if (inDegree === 0) {
        insertMinHeap(heap, index);
      }
    }

    const order: Index[] = [];

    while (heap.length > 0) {
      const got = deleteMinHeap(heap)!;
      order.push(got);

      const neighbors = graph.get(got);
      if (!neighbors) continue;
      for (const neighbor of neighbors) {
        const inDegree = inDegrees.get(neighbor)!;
        if (inDegree > 0) {
          inDegrees.set(neighbor, inDegree - 1);
          if (inDegree - 1 === 0) {
            insertMinHeap(heap, neighbor);
          }
        }
      }
    }

    if (order.length !== inDegrees.size) {
      // TODO: add more specific error for where the cycle occurred?
      throw new CompileModelError(
        "Cycle detected in assignments." + order.length + "," + inDegrees.size,
      );
    }

    return order.map((index) => this.#indexToAssignment(index));
  }

  #getReferenced(expression: IridiumExpression): Index[] {
    const referenced = new Set<Index>();
    const listener: IridiumExpressionListener = {
      afterVariable: ({ name }) => {
        if (this.#yTable.has(name)) {
          referenced.add(asY(this.#yTable.get(name)));
          return;
        }

        if (this.#pTable.has(name)) {
          referenced.add(asP(this.#pTable.get(name)));
          return;
        }
      },
      afterRateOf: ({ name }) => referenced.add(asP(this.#pTable.get(name))),
    };
    walkExpression(expression, listener);
    return Array.from(referenced);
  }
}

const insertMinHeap = (heap: Index[], value: Index): void => {
  let i = heap.length;
  heap[i] = value;

  while (i > 0) {
    const parentI = Math.floor((i - 1) / 2);
    const parent = heap[parentI];
    if (value < parent) {
      heap[i] = parent;
      heap[parentI] = value;
      i = parentI;
    } else {
      break;
    }
  }
};

const deleteMinHeap = (heap: Index[]): Index | undefined => {
  if (heap.length === 0) return undefined;

  const got = heap[0];
  const value = heap.pop()!;
  let i = 0;

  // otherwise if we have one element, it will just stay stuck there
  if (heap.length > 0) {
    heap[i] = value;
  }

  while (true) {
    const leftI = i * 2 + 1;

    if (leftI >= heap.length) break;

    const rightI = i * 2 + 2;

    let swapI = leftI;

    if (rightI < heap.length && heap[rightI] < heap[leftI]) {
      swapI = rightI;
    }

    if (heap[i] <= heap[swapI]) break;

    const swap = heap[swapI];
    heap[i] = swap;
    heap[swapI] = value;
    i = swapI;
  }

  return got;
};

export const createAssignmentsGraphFromCompilation = (
  {
    yTable,
    pTable,
    variables,
    reactions,
    algebraicRules,
    compartments,
  }: Compilation,
  isForInitialValues?: boolean,
): AssignmentGraph => {
  const yAssignments = new Map<string, IridiumExpression>();
  const ydotAssignments = new Map<string, IridiumExpression>();
  const pAssignments = new Map<string, IridiumExpression>();

  // collect stoichiometry matrix

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

  // state assignments

  for (const reaction of reactions.values()) {
    pAssignments.set(reaction.name, reaction.rate);
  }

  const addInitialValue = (
    assignmentTable: Map<string, IridiumExpression>,
    variable: IridiumVariable,
  ): void => {
    const compartment = compartments.get(variable.name);
    if (isForInitialValues && "initial" in variable.value) {
      if (!isForInitialValues && !variable.hasSubstanceOnly && compartment) {
        assignmentTable.set(
          variable.name,
          expr.mul(variable.value.initial, expr.var(compartment.name)),
        );
      } else {
        assignmentTable.set(variable.name, variable.value.initial);
      }
    }
  };

  for (const variable of variables.values()) {
    switch (variable.value.kind) {
      case "initial":
        addInitialValue(pAssignments, variable);
        break;
      case "algebraic":
        addInitialValue(yAssignments, variable);
        break;
      case "rate": {
        addInitialValue(yAssignments, variable);

        const compartment = compartments.get(variable.name);
        let assignment = variable.value.rate;
        if (!isForInitialValues && !variable.hasSubstanceOnly && compartment) {
          assignment = expr.mul(assignment, expr.var(compartment.name));
          // NOTE: We are failing to account for the scenario where the COMPARTMENT has an assignment rule since that would
          //       require differentiating the volume which is not fun.
          if (
            compartment.value.kind === "rate" ||
            compartment.value.kind === "reaction"
          ) {
            // do product rule: d/dt (x * y) = x * dy/dt + y * dx/dt
            assignment = expr.add(
              assignment,
              expr.mul(expr.rateOf(compartment.name), expr.var(variable.name)),
            );
          }
        }
        ydotAssignments.set(variable.name, assignment);
        break;
      }
      case "assignment": {
        const compartment = compartments.get(variable.name);
        if (!isForInitialValues && !variable.hasSubstanceOnly && compartment) {
          pAssignments.set(
            variable.name,
            expr.mul(variable.value.assignment, expr.var(compartment.name)),
          );
        } else {
          pAssignments.set(variable.name, variable.value.assignment);
        }
        break;
      }
      case "reaction": {
        addInitialValue(yAssignments, variable);

        const reactions = involvedReactions.get(variable.name);

        if (reactions) {
          const terms: IridiumExpression[] = [];
          for (const [reaction, stoichExpr] of reactions) {
            const constStoich = tryEvaluateStoichiometry(stoichExpr);
            if (constStoich === 0) continue;

            if (constStoich === null) {
              // can't be evaluated at compile-time, manually evaluate at runtime
              terms.push(expr.mul(expr.var(reaction), stoichExpr));
            } else if (constStoich === -1) {
              terms.push(expr.neg(expr.var(reaction)));
            } else if (constStoich !== 1) {
              terms.push(expr.mul(expr.var(reaction), expr.num(constStoich)));
            } else {
              terms.push(expr.var(reaction));
            }
          }

          ydotAssignments.set(
            variable.name,
            terms.reduce<IridiumExpression | undefined>(
              (acc, current) => (acc ? expr.add(current, acc) : current),
              undefined,
            ) ?? expr.num(0),
          );
        } else {
          ydotAssignments.set(variable.name, expr.num(0));
        }

        break;
      }
    }
  }

  return new AssignmentGraph(
    yTable,
    pTable,
    yAssignments,
    ydotAssignments,
    pAssignments,
    new Map(algebraicRules.map(({ name, expression }) => [name, expression])),
  );
};
