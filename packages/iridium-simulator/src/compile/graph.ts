import {
  walkExpression,
  type IridiumExpression,
  type IridiumExpressionListener,
} from "../ir/ast";
import { CompileModelError } from "./errors";
import type { IndexSymbolTable } from "./symbolTables";

type Index = number & { readonly __brand: unique symbol };

export type Name = {
  kind: "name" | "rate";
  name: string;
};

export type Assignment = Name & {
  expression: IridiumExpression;
};

// This tag are two-fold. They are used in the topo sort so that ydot/p assignments
// go after y assignments and to recover the original name from the index.
const P_TAG = 0x4000_0000;

const asY = (index: number): Index => index as Index;
const asP = (index: number): Index => (index | P_TAG) as Index;

export class AssignmentGraph {
  #yTable: IndexSymbolTable;
  #pTable: IndexSymbolTable;
  #names: Map<Index, Name>;
  #assignments: Map<Index, Assignment>;

  constructor(
    y: IndexSymbolTable,
    p: IndexSymbolTable,
    yAssignments: Map<string, IridiumExpression>,
    ydotAssignments: Map<string, IridiumExpression>,
    pAssignments: Map<string, IridiumExpression>,
  ) {
    this.#yTable = y;
    this.#pTable = p;
    this.#assignments = new Map();
    this.#names = new Map();

    const yNames = y.keys();
    for (let i = 0; i < yNames.length; i++) {
      const name = yNames[i];

      const yAssignment = yAssignments.get(name);
      if (yAssignment) {
        this.#names.set(asY(i), { kind: "name", name });
        this.#assignments.set(asY(i), {
          kind: "name",
          name,
          expression: yAssignment,
        });
      }

      const ydotAssignment = ydotAssignments.get(name);
      if (ydotAssignment) {
        const index = asP(this.#pTable.get(name));
        this.#names.set(index, { kind: "rate", name });
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
        this.#names.set(asP(i), { kind: "name", name });
        this.#assignments.set(asP(i), {
          kind: "name",
          name,
          expression: pAssignment,
        });
      }
    }
  }

  #assignmentToIndex(assignment: Name): Index {
    if (assignment.kind === "name") {
      if (this.#yTable.has(assignment.name)) {
        return asY(this.#yTable.get(assignment.name));
      } else {
        return asP(this.#pTable.get(assignment.name));
      }
    } else {
      return asP(this.#pTable.get(assignment.name));
    }
  }

  #indexToAssignment(index: Index): Assignment {
    return this.#assignments.get(index)!;
  }

  getAssignmentOrder(assignments: Name[]): Assignment[] {
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
