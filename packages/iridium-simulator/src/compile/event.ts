import {
  FunctionTable,
  IndexSymbolTable,
  LocalsSymbolTable,
} from "./symbolTables.ts";
import { OpCode, ValType } from "./codes";
import Emitter from "./Emitter";
import { CompileError, CompileInvariantError } from "./errors";
import {
  ROOTS_NAME,
  CHECK_ROOTS_NAME,
  P_PARAM,
  T_PARAM,
  TIME_NAME,
  Y_PARAM,
  generateSymbol,
  UPDATE_CONDITIONS_NAME,
  EVENTS_PARAM,
} from "../names";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE, SIZEOF_INT } from "./constants";
import { getAssignmentOrder } from "./evaluate";
import type { WasmFunction } from "./functions";
import type { Compilation } from "./Compilation.ts";
import { Scope } from "./Scope.ts";
import {
  visitExpression,
  type IridiumExpression,
  type IridiumExpressionBinary,
  type IridiumExpressionVisitor,
} from "../ir/ast.ts";
import { emitComparisonOperator, emitExpression } from "./expression.ts";
import type { IridiumEvent } from "../ir/model.ts";
import type { RuntimeEvent, RuntimePieceEvent } from "../runtime/model.ts";

const ROOTS_PARAMS = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const ROOTS_RESULTS: ValType[] = [];

const CHECK_ROOTS_PARAMS = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const CHECK_ROOTS_RESULTS: ValType[] = [];

const UPDATE_CONDITIONS_PARAMS = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const UPDATE_CONDITIONS_RESULTS: ValType[] = [];

const GET_OPTION_PARAMS = [ValType.f64, ValType.i32, ValType.i32, ValType.i32];
const GET_OPTION_RESULTS = [ValType.f64];

const GET_ASSIGNMENTS_PARAMS = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const GET_ASSIGNMENTS_RESULTS: ValType[] = [];

type ComparisonOperator =
  | "and"
  | "or"
  | "lt"
  | "le"
  | "gt"
  | "ge"
  | "eq"
  | "neq";
type Condition = {
  op: ComparisonOperator;
  left: IridiumExpression;
  right: IridiumExpression;
};

type LogicTree =
  | number
  | boolean
  | { kind: "or"; left: LogicTree; right: LogicTree }
  | { kind: "xor"; left: LogicTree; right: LogicTree }
  | { kind: "and"; left: LogicTree; right: LogicTree }
  | { kind: "implies"; left: LogicTree; right: LogicTree }
  | { kind: "not"; child: LogicTree };

type InternalEvent = {
  conditions: Condition[];
  tree: LogicTree;
};

const emitConditionAsRoot = (
  expression: Condition,
  emitter: Emitter,
  compilation: Compilation,
  scope: Scope,
): void => {
  emitExpression(expression.left, emitter, compilation, scope);
  emitExpression(expression.right, emitter, compilation, scope);
  emitter.emitByte(OpCode.f64sub);

  // We need to do a little trick when we end up exactly at the event boundary.
  // For example, take the event `at time > 0:`. CVODE will ignore the root at
  // the beginning because the sign does not change. To fix this, we nudge the
  // function a very very very tiny amount down (or up if it is <). That way
  // it will be like -0.000000000000000000001 then 0.001 or whatever and
  // CVODE will see the sign change! But if we do this, another issue comes up:
  // What if we end up exactly at where we nudged the boundary? In such cases,
  // I think it is fair to give up. What RoadRunner seems to do is have its events as
  // discontinuous function that is 1 on true and -1 on false. We can also do that,
  // it will actually be way less of a headache.
  if (expression.op === "gt") {
    emitter.emitF64ConstOp(Number.EPSILON);
    emitter.emitByte(OpCode.f64sub);
  } else if (expression.op === "lt") {
    emitter.emitF64ConstOp(Number.EPSILON);
    emitter.emitByte(OpCode.f64add);
  }
};

const isComparisonExpression = (
  expr: IridiumExpression,
): expr is IridiumExpressionBinary => {
  return (
    expr.kind === "binary" &&
    (expr.op === "eq" ||
      expr.op === "neq" ||
      expr.op === "lt" ||
      expr.op === "le" ||
      expr.op === "gt" ||
      expr.op == "ge")
  );
};

/**
 * Gets the conditions from a formula and a logic tree to execute it.
 */
const createInternalEvent = (root: IridiumExpression): InternalEvent => {
  const treeStack: LogicTree[] = [];
  const conditions: Condition[] = [];

  const pushBinaryLogicalOp = (
    expr: IridiumExpression,
    kind: "and" | "or",
  ): void => {
    const right = treeStack.pop();
    const left = treeStack.pop();
    if (left === undefined || right === undefined) {
      throw new CompileError(
        "Invalid event trigger. Must evaluate to boolean.",
        expr.metadata,
      );
    }
    treeStack.push({ kind, left, right });
  };

  const visitor: IridiumExpressionVisitor<void> = {
    visitBinary(expr) {
      const { op, left, right } = expr;
      switch (op) {
        case "and":
          visitExpression(left, visitor);
          visitExpression(right, visitor);

          pushBinaryLogicalOp(expr, "and");
          break;
        case "or":
          visitExpression(left, visitor);
          visitExpression(right, visitor);

          pushBinaryLogicalOp(expr, "or");
          break;
        case "eq":
        case "neq":
        case "lt":
        case "le":
        case "gt":
        case "ge":
          if (isComparisonExpression(left)) {
            visitExpression(left, visitor);
          }

          if (isComparisonExpression(right)) {
            visitExpression(right, visitor);
          }

          treeStack.push(conditions.length);

          // It's left recursive. We want to split things like `(((0 < x) < 5) == 5)` into `0 < x && x < 5 && 5 == 5`
          if (isComparisonExpression(left)) {
            conditions.push({
              op: op as ComparisonOperator,
              left: left.right,
              right: right,
            });

            pushBinaryLogicalOp(expr, "and");
          } else {
            // We flip the != so it is false more often than it is true.
            // This is so they are more likely to fire when they should
            // (it is not perfect though)
            if (op === "neq") {
              treeStack.push({
                kind: "not",
                child: treeStack.pop() as LogicTree,
              });
            }

            conditions.push({
              op: op as ComparisonOperator,
              left,
              right,
            });
          }
          break;
        default:
          throw new CompileError("Expected boolean expression.", expr.metadata);
      }
    },
    visitUnary(expr) {
      const { op, expr: child } = expr;
      switch (op) {
        case "not":
          visitExpression(child, visitor);
          treeStack.push({
            kind: "not",
            child: treeStack.pop() as LogicTree,
          });
          break;
        default:
          throw new CompileError("Expected boolean expression.", expr.metadata);
      }
    },
    visitCall(expr) {
      const { name, args } = expr;
      if (name === "and") {
        visitVariadicFunction(true, "and", args);
      } else if (name === "or") {
        visitVariadicFunction(false, "or", args);
      } else if (name === "xor") {
        visitVariadicFunction(false, "xor", args);
      } else if (name === "implies") {
        if (args.length !== 2) {
          throw new CompileError(
            "Expected 2 argument for implies.",
            expr.metadata,
          );
        }

        visitExpression(args[0], visitor);
        visitExpression(args[1], visitor);

        const right = treeStack.pop()!;
        const left = treeStack.pop()!;
        treeStack.push({
          kind: "implies",
          left,
          right,
        });
      } else if (name === "not") {
        if (args.length !== 1) {
          throw new CompileError("Expected 1 argument for not.", expr.metadata);
        }

        visitExpression(args[0], visitor);

        const child = treeStack.pop()!;
        treeStack.push({
          kind: "not",
          child,
        });
      } else {
        throw new CompileError("Expected boolean expression.", expr.metadata);
      }
    },
    visitNumber(expr) {
      throw new CompileError("Expected boolean expression.", expr.metadata);
    },
    visitVariable(expr) {
      throw new CompileError("Expected boolean expression.", expr.metadata);
    },
  };

  const visitVariadicFunction = (
    defaultValue: boolean,
    kind: "or" | "xor" | "and",
    args: IridiumExpression[],
  ): void => {
    if (args.length === 0) {
      treeStack.push(defaultValue);
    } else {
      for (let i = 0; i < args.length; i++) {
        visitExpression(args[i], visitor);

        if (i > 0) {
          const right = treeStack.pop()!;
          const left = treeStack.pop()!;
          treeStack.push({ kind, left, right });
        }
      }
    }
  };

  visitExpression(root, visitor);

  if (treeStack.length !== 1) {
    throw new CompileError(
      "Unexpected error. Please report this bug with code.",
      root.metadata,
    );
  }

  return { tree: treeStack[0], conditions };
};

export const compileEvents = (
  compilation: Compilation,
): {
  functions: WasmFunction[];
  runtimeEvents: (RuntimeEvent | RuntimePieceEvent)[];
} => {
  const internalEvents: InternalEvent[] = [];
  const runtimeEvents: (RuntimeEvent | RuntimePieceEvent)[] = [];
  const eventFns: WasmFunction[] = [];

  for (const [piece, index] of compilation.piecewisePieces) {
    const internalEvent = createInternalEvent(piece);
    internalEvents[index] = internalEvent;
    runtimeEvents.push({
      isForPiecewise: true,
      numRoots: internalEvent.conditions.length,
    });
  }

  for (const event of compilation.events.values()) {
    const internalEvent = createInternalEvent(event.trigger);
    const yIndices = new IndexSymbolTable();
    const pIndices = new IndexSymbolTable();

    for (const { name, metadata: assignmentMetadata } of event.assignments) {
      if (compilation.yTable.has(name)) {
        yIndices.add(name);
      } else if (compilation.pTable.has(name)) {
        pIndices.add(name);
      } else if (name === TIME_NAME) {
        throw new CompileError(
          "You cannot assign to time.",
          assignmentMetadata,
        );
      } else {
        throw new CompileError(`Unbound name: ${name}.`, assignmentMetadata);
      }
    }

    let getDelayExport: string | undefined;
    let getPriorityExport: string | undefined;
    const getAssignmentsExport = generateSymbol("getAssignments");

    if (event.delay) {
      getDelayExport = generateSymbol("getDelay");
      eventFns.push({
        kind: "compile",
        isExported: true,
        name: getDelayExport,
        params: GET_OPTION_PARAMS,
        results: GET_OPTION_RESULTS,
        compileBody: (functionTable) =>
          compileGetOption(
            compilation,
            event.delay!,
            functionTable,
          ).getOutput(),
      });
    }

    if (event.priority) {
      getPriorityExport = generateSymbol("getPriority");
      eventFns.push({
        kind: "compile",
        isExported: true,
        name: getPriorityExport,
        params: GET_OPTION_PARAMS,
        results: GET_OPTION_RESULTS,
        compileBody: (functionTable) =>
          compileGetOption(
            compilation,
            event.priority!,
            functionTable,
          ).getOutput(),
      });
    }

    eventFns.push({
      kind: "compile",
      isExported: true,
      name: getAssignmentsExport,
      params: GET_ASSIGNMENTS_PARAMS,
      results: GET_ASSIGNMENTS_RESULTS,
      compileBody: (functionTable) =>
        compileGetAssignments(
          compilation,
          event,
          yIndices,
          pIndices,
          functionTable,
        ).getOutput(),
    });

    runtimeEvents.push({
      getAssignmentsExport,
      getDelayExport,
      getPriorityExport,
      numRoots: internalEvent.conditions.length,

      // These are actually a different set of indices.
      // We start with maybe some variables: A, B, C
      // In the getAssignments function we are given a double[3] array.
      // We pick [A: 1, B: 2, C: 3]
      // Then let's say the index of A in the model is 2, B is 4, C is 10
      // In the EventSpec, we say [1: 2, 2: 4, 3: 10]
      // Now when someone else reads the double[3] array, they know the first
      yIndices: yIndices.keys().map((y) => compilation.yTable.get(y)),
      pIndices: pIndices.keys().map((p) => compilation.pTable.get(p)),

      isPersistent: event.isPersistent,
      isFromTrigger: event.isFromTrigger,
      isT0: event.isT0,
    });

    internalEvents.push(internalEvent);
  }

  return {
    functions: [
      {
        kind: "compile",
        isExported: true,
        name: ROOTS_NAME,
        params: ROOTS_PARAMS,
        results: ROOTS_RESULTS,
        compileBody: (functionTable) =>
          compileRoots(compilation, internalEvents, functionTable).getOutput(),
      },
      {
        kind: "compile",
        isExported: true,
        name: CHECK_ROOTS_NAME,
        params: CHECK_ROOTS_PARAMS,
        results: CHECK_ROOTS_RESULTS,
        compileBody: (functionTable) =>
          compileCheckRoots(
            compilation,
            internalEvents,
            functionTable,
          ).getOutput(),
      },
      {
        kind: "compile",
        isExported: true,
        name: UPDATE_CONDITIONS_NAME,
        params: UPDATE_CONDITIONS_PARAMS,
        results: UPDATE_CONDITIONS_RESULTS,
        compileBody: (functionTable) =>
          compileUpdateConditions(
            compilation,
            internalEvents,
            functionTable,
          ).getOutput(),
      },
      ...eventFns,
    ],
    runtimeEvents,
  };
};

const G_PARAM = "g[]";

const compileRoots = (
  compilation: Compilation,
  events: InternalEvent[],
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    G_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);

  // no locals
  emitter.emitListHeader(0);

  const scope = new Scope(compilation, localsTable, functionTable);

  let currentRootIndex = 0;

  for (const event of events) {
    for (const condition of event.conditions) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(G_PARAM));

      emitConditionAsRoot(condition, emitter, compilation, scope);

      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * currentRootIndex);

      currentRootIndex += 1;
    }
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};

const CONDITIONS_PARAM = "conditions[]";
const ROOTS_PARAM = "roots[]";

const emitLogicTree = (
  tree: LogicTree,
  emitter: Emitter,
  localsTable: LocalsSymbolTable,
  startRootIndex: number,
) => {
  if (typeof tree === "number") {
    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

    emitter.emitByte(OpCode.i32load);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_INT * (startRootIndex + tree));
  } else if (typeof tree === "boolean") {
    emitter.emitI32ConstOp(tree ? 1 : 0);
  } else if (tree.kind === "and") {
    emitLogicTree(tree.left, emitter, localsTable, startRootIndex);
    emitLogicTree(tree.right, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32and);
  } else if (tree.kind === "or") {
    emitLogicTree(tree.left, emitter, localsTable, startRootIndex);
    emitLogicTree(tree.right, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32or);
  } else if (tree.kind === "xor") {
    emitLogicTree(tree.left, emitter, localsTable, startRootIndex);
    emitLogicTree(tree.right, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32xor);
  } else if (tree.kind === "implies") {
    emitLogicTree(tree.left, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32eqz);
    emitLogicTree(tree.right, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32or);
  } else if (tree.kind === "not") {
    emitLogicTree(tree.child, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32eqz);
  }
};

const compileCheckRoots = (
  compilation: Compilation,
  events: InternalEvent[],
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  emitter.emitListHeader(0);

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    ROOTS_PARAM,
    CONDITIONS_PARAM,
    EVENTS_PARAM,
  ]);

  const scope = new Scope(compilation, localsTable, functionTable);

  let currentRootIndex = 0;
  let currentEventIndex = 0;

  for (const event of events) {
    const startRootIndex = currentRootIndex;

    for (const condition of event.conditions) {
      if (condition.op === "eq" || condition.op === "neq") {
        // For equality, we want to check the condition again if it is true
        // even if no root was hit since we may not be equal anymore (which wouldn't
        // be detected by the root-finder usually)
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

        emitter.emitByte(OpCode.i32load);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_INT * currentRootIndex);

        emitter.emitByte(OpCode.i32eqz);

        emitter.emitIf(
          OpCode.blockNoType,
          () => {
            // Prior state was false, check the root if we had any crossing (it will be true
            // at this moment (or false for !=))
            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

            // load the root
            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getParam(ROOTS_PARAM));

            emitter.emitByte(OpCode.i32load);
            emitter.emitUint(MEM_ALIGNMENT);
            emitter.emitUint(SIZEOF_INT * currentRootIndex);

            emitter.emitI32ConstOp(0);
            if (condition.op === "neq") {
              emitter.emitByte(OpCode.i32eq);
            } else {
              emitter.emitByte(OpCode.i32ne);
            }

            emitter.emitByte(OpCode.i32store);
            emitter.emitUint(MEM_ALIGNMENT);
            emitter.emitUint(SIZEOF_INT * currentRootIndex);
          },
          () => {
            // Prior state was true, so re-evaluate it
            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

            emitExpression(condition.left, emitter, compilation, scope);
            emitExpression(condition.right, emitter, compilation, scope);
            emitComparisonOperator(emitter, condition.op);

            emitter.emitByte(OpCode.i32store);
            emitter.emitUint(MEM_ALIGNMENT);
            emitter.emitUint(SIZEOF_INT * currentRootIndex);
          },
        );
      } else {
        // For inequalities, it is adequate to just check the direction of sign change since
        // they will remain true for an interval rather than just a moment.

        // load the root
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(ROOTS_PARAM));

        emitter.emitByte(OpCode.i32load);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_INT * currentRootIndex);

        // check if the root was changed
        emitter.emitI32ConstOp(0);

        emitter.emitByte(OpCode.i32ne);

        // if so, update condition
        emitter.emitIf(OpCode.blockNoType, () => {
          emitter.emitByte(OpCode.localget);
          emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

          emitter.emitByte(OpCode.localget);
          emitter.emitUint(localsTable.getParam(ROOTS_PARAM));

          emitter.emitByte(OpCode.i32load);
          emitter.emitUint(MEM_ALIGNMENT);
          emitter.emitUint(SIZEOF_INT * currentRootIndex);

          if (condition.op === "ge" || condition.op === "gt") {
            emitter.emitI32ConstOp(0);
            emitter.emitByte(OpCode.i32ge_s);
          } else if (condition.op === "le" || condition.op === "lt") {
            emitter.emitI32ConstOp(0);
            emitter.emitByte(OpCode.i32le_s);
          } else {
            throw new CompileInvariantError(
              `Unexpected comparison operator: ${condition.op}`,
            );
          }

          emitter.emitByte(OpCode.i32store);
          emitter.emitUint(MEM_ALIGNMENT);
          emitter.emitUint(SIZEOF_INT * currentRootIndex);
        });
      }

      currentRootIndex += 1;
    }

    // update the event out
    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(EVENTS_PARAM));

    emitLogicTree(event.tree, emitter, localsTable, startRootIndex);

    emitter.emitByte(OpCode.i32store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_INT * currentEventIndex);

    currentEventIndex += 1;
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};

const LEFT_LOCAL = "left";
const RIGHT_LOCAL = "right";
const SHOULD_SKIP_EVENT_LOCAL = "shouldSkipEvent";

const compileUpdateConditions = (
  compilation: Compilation,
  events: InternalEvent[],
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  // ask for 2 float64 locals, 1 i32 local
  emitter.emitListHeader(2);
  emitter.emitUint(2);
  emitter.emitByte(ValType.f64);

  emitter.emitUint(1);
  emitter.emitByte(ValType.i32);

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    CONDITIONS_PARAM,
    EVENTS_PARAM,
  ]);

  localsTable.addLocal(LEFT_LOCAL);
  localsTable.addLocal(RIGHT_LOCAL);
  localsTable.addLocal(SHOULD_SKIP_EVENT_LOCAL);

  const scope = new Scope(compilation, localsTable, functionTable);

  let currentRootIndex = 0;
  let currentEventIndex = 0;

  for (const event of events) {
    const startRootIndex = currentRootIndex;

    // update every condition
    for (const condition of event.conditions) {
      // These have to be handled specially because we are not able to really implement them at a boundary
      // without stepping an infitesimal step forward. Our strategy is to NOT do anything if we end up
      // at a boundary. Instead, in the root function, we nudge the inequalities slightly so a root will be
      // found if we end up moving in the right direction. Then we can just rely on the normal root check code.
      if (condition.op === "gt" || condition.op === "lt") {
        emitExpression(condition.left, emitter, compilation, scope);
        emitter.emitByte(OpCode.localset);
        emitter.emitUint(localsTable.getLocal(LEFT_LOCAL));

        emitExpression(condition.right, emitter, compilation, scope);
        emitter.emitByte(OpCode.localset);
        emitter.emitUint(localsTable.getLocal(RIGHT_LOCAL));

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(LEFT_LOCAL));

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(RIGHT_LOCAL));

        emitter.emitByte(OpCode.f64eq);

        // case: boundary, can't make any conclusions about this event
        emitter.emitIf(
          OpCode.blockNoType,
          () => {
            // Set local so we know to ignore updating the event.
            emitter.emitI32ConstOp(1);

            emitter.emitByte(OpCode.localset);
            emitter.emitByte(localsTable.getLocal(SHOULD_SKIP_EVENT_LOCAL));

            // It's OK to set the condition to false because at the boundary it is not true yet.
            // If the root-finding function hits it, this will update as required.
            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

            emitter.emitI32ConstOp(0);

            emitter.emitByte(OpCode.i32store);
            emitter.emitUint(MEM_ALIGNMENT);
            emitter.emitUint(SIZEOF_INT * currentRootIndex);
          },
          () => {
            // case: not a boundary, we can confidently update the condition
            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getLocal(LEFT_LOCAL));

            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getLocal(RIGHT_LOCAL));

            emitComparisonOperator(emitter, condition.op);

            emitter.emitByte(OpCode.i32store);
            emitter.emitUint(MEM_ALIGNMENT);
            emitter.emitUint(SIZEOF_INT * currentRootIndex);
          },
        );
      } else {
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

        emitExpression(condition.left, emitter, compilation, scope);
        emitExpression(condition.right, emitter, compilation, scope);
        emitComparisonOperator(emitter, condition.op);

        emitter.emitByte(OpCode.i32store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_INT * currentRootIndex);
      }

      currentRootIndex += 1;
    }

    // check if we should skip
    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getLocal(SHOULD_SKIP_EVENT_LOCAL));

    emitter.emitIf(
      OpCode.blockNoType,
      () => {
        // reset the flag
        emitter.emitI32ConstOp(0);

        emitter.emitByte(OpCode.localset);
        emitter.emitUint(localsTable.getLocal(SHOULD_SKIP_EVENT_LOCAL));
      },
      () => {
        // update the event out
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(EVENTS_PARAM));

        emitLogicTree(event.tree, emitter, localsTable, startRootIndex);

        emitter.emitByte(OpCode.i32store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_INT * currentEventIndex);
      },
    );

    currentEventIndex += 1;
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};

const compileGetOption = (
  compilation: Compilation,
  expression: IridiumExpression,
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);

  emitter.emitListHeader(0);

  const scope = new Scope(compilation, localsTable, functionTable);
  emitExpression(expression, emitter, compilation, scope);

  emitter.emitByte(OpCode.end);

  return emitter;
};

const Y_OUT_PARAM = "yout[]";
const P_OUT_PARAM = "pout[]";

const compileGetAssignments = (
  compilation: Compilation,
  event: IridiumEvent,
  yIndices: IndexSymbolTable,
  pIndices: IndexSymbolTable,
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    EVENTS_PARAM,
    Y_OUT_PARAM,
    P_OUT_PARAM,
  ]);

  emitter.emitListHeader(0);

  const ordering = getAssignmentOrder(
    new Map(event.assignments.map((a) => [a.name, a.value])),
    {
      allowSelfCycle: true,
    },
  );

  const scope = new Scope(compilation, localsTable, functionTable);

  const assignmentMap = new Map(event.assignments.map((a) => [a.name, a]));
  for (const name of ordering) {
    const assignment = assignmentMap.get(name)!;

    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_OUT_PARAM));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_OUT_PARAM));
    } else if (name === TIME_NAME) {
      throw new CompileError("You cannot assign to time.", assignment.metadata);
    } else {
      throw new CompileError("Unexpected assignment.", assignment.metadata);
    }

    emitExpression(assignment.value, emitter, compilation, scope);

    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * yIndices.get(name));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * pIndices.get(name));
    }
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};
