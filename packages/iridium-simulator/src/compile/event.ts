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
import type { WasmFunction } from "./functions";
import type { Compilation } from "./Compilation.ts";
import { GlobalScope } from "./scope.ts";
import {
  visitExpression,
  type IridiumExpression,
  type IridiumExpressionVisitor,
} from "../ir/ast.ts";
import { emitComparisonOperator, emitExpression } from "./expression.ts";
import type { IridiumEvent, IridiumEventAssignment } from "../ir/model.ts";
import type { RuntimeEvent, RuntimePieceEvent } from "../runtime/model.ts";
import { builtinConstants } from "antimony-language/semantic/builtins";

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

const SET_ASSIGNMENTS_PARAMS = [
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const SET_ASSIGNMENTS_RESULTS: ValType[] = [];

type ComparisonOperator =
  | "and"
  | "or"
  | "lt"
  | "le"
  | "gt"
  | "ge"
  | "eq"
  | "neq";

/**
 * Simple conditions express your normal comparison expressions.
 * They compile to signed distance functions (except for lt and gt
 * which we need to handle separately since they don't have a boundary).
 */
type SimpleCondition = {
  op: ComparisonOperator;
  left: IridiumExpression;
  right: IridiumExpression;
};

/**
 * Complex conditions are basically anything that we aren't sure is a boolean.
 * They are also used in the conditions for piecewise since they simplify things
 * a lot.
 * Unlike simple conditions, complex conditions will compile to a function that flips
 * between -1 and 1 based on if the expression equals 0.
 */
type ComplexCondition = {
  expression: IridiumExpression;
};

type Condition = SimpleCondition | ComplexCondition;

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
  condition: Condition,
  emitter: Emitter,
  compilation: Compilation,
  scope: GlobalScope,
): void => {
  if ("op" in condition) {
    // It's a simple condition, compile it as a signed distance function unless it is gt or lt.
    if (condition.op === "lt" || condition.op === "gt") {
      // We need to do a little trick when we end up exactly at the event boundary.
      // For example, take the event `at time > 0:`. CVODE will ignore the root at
      // the beginning because the sign does not change. To fix this, we convert the
      // root function so that it flips between -1 and 1 if the condition is true.
      // This way the boundary is treated correctly, at the cost of CVODE having
      // less information.
      emitExpression(condition.left, emitter, scope, { compilation });
      emitExpression(condition.right, emitter, scope, { compilation });
      emitComparisonOperator(emitter, condition.op);

      emitter.emitI32ConstOp(0);
      emitter.emitByte(OpCode.i32ne);

      emitter.emitIf(
        ValType.f64,
        () => {
          emitter.emitF64ConstOp(condition.op === "gt" ? 1 : -1);
        },
        () => {
          emitter.emitF64ConstOp(condition.op === "gt" ? -1 : 1);
        },
      );
    } else {
      emitExpression(condition.left, emitter, scope, { compilation });
      emitExpression(condition.right, emitter, scope, { compilation });
      emitter.emitByte(OpCode.f64sub);
    }
  } else {
    // It's complex condition, compile it as a discrete -1, 1 flipper
    emitExpression(condition.expression, emitter, scope, { compilation });

    emitter.emitF64ConstOp(0);
    emitter.emitByte(OpCode.f64ne);

    emitter.emitIf(
      ValType.f64,
      () => {
        emitter.emitF64ConstOp(1);
      },
      () => {
        emitter.emitF64ConstOp(-1);
      },
    );
  }
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
          treeStack.push(conditions.length);

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
        visitNonBooleanExpression(expr);
      }
    },
    visitNumber(expr) {
      visitNonBooleanExpression(expr);
    },
    visitVariable(expr) {
      if (builtinConstants[expr.name]) {
        treeStack.push(builtinConstants[expr.name].value !== 0);
      } else {
        visitNonBooleanExpression(expr);
      }
    },
  };

  const visitNonBooleanExpression = (expression: IridiumExpression): void => {
    treeStack.push(conditions.length);
    conditions.push({ expression });
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

  for (const { index, condition } of compilation.piecewisePieces.values()) {
    const internalEvent: InternalEvent = {
      conditions: [{ expression: condition }],
      tree: 0,
    };
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
    const setAssignmentsExport = generateSymbol("setAssignments");

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

    eventFns.push({
      kind: "compile",
      isExported: true,
      name: setAssignmentsExport,
      params: SET_ASSIGNMENTS_PARAMS,
      results: SET_ASSIGNMENTS_RESULTS,
      compileBody: (functionTable) =>
        compileSetAssignments(
          compilation,
          event,
          yIndices,
          pIndices,
          functionTable,
        ).getOutput(),
    });

    runtimeEvents.push({
      getAssignmentsExport,
      setAssignmentsExport,
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

  const scope = new GlobalScope(compilation, localsTable, functionTable);

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

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  let currentRootIndex = 0;
  let currentEventIndex = 0;

  for (const event of events) {
    const startRootIndex = currentRootIndex;

    for (const condition of event.conditions) {
      if (
        "op" in condition &&
        (condition.op === "eq" || condition.op === "neq")
      ) {
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

            emitExpression(condition.left, emitter, scope, { compilation });
            emitExpression(condition.right, emitter, scope, { compilation });
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

          if (
            "expression" in condition ||
            condition.op === "ge" ||
            condition.op === "gt"
          ) {
            // Complex conditions go from -1 to 1 when they become true so they go on this branch
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

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  let currentRootIndex = 0;
  let currentEventIndex = 0;

  for (const event of events) {
    const startRootIndex = currentRootIndex;

    // update every condition
    for (const condition of event.conditions) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

      if ("expression" in condition) {
        emitExpression(condition.expression, emitter, scope, { compilation });
        emitter.emitF64ConstOp(0);
        emitter.emitByte(OpCode.f64ne);
      } else {
        emitExpression(condition.left, emitter, scope, { compilation });
        emitExpression(condition.right, emitter, scope, { compilation });
        emitComparisonOperator(emitter, condition.op);
      }

      emitter.emitByte(OpCode.i32store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_INT * currentRootIndex);

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

  const scope = new GlobalScope(compilation, localsTable, functionTable);
  emitExpression(expression, emitter, scope, { compilation });

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

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  for (const { name, value, metadata } of event.assignments) {
    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_OUT_PARAM));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_OUT_PARAM));
    } else if (name === TIME_NAME) {
      throw new CompileError("You cannot assign to time.", metadata);
    } else {
      throw new CompileError("Unexpected assignment.", metadata);
    }

    emitExpression(value, emitter, scope, { compilation });

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

const compileSetAssignments = (
  compilation: Compilation,
  event: IridiumEvent,
  yIndices: IndexSymbolTable,
  pIndices: IndexSymbolTable,
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    Y_PARAM,
    P_PARAM,
    Y_OUT_PARAM,
    P_OUT_PARAM,
    // NOTE: we actually don't have these as a parameter, just pass it to please Scope
    // TODO: please do this better
    T_PARAM,
    EVENTS_PARAM,
  ]);

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  emitter.emitListHeader(0);

  // We need to assign to variables with compartments since if we update the compartment before, it will not be "simultaneous" as required by the spec.
  // (see test case 1779 in the sbmltestsuite)
  const first: IridiumEventAssignment[] = [];
  const second: IridiumEventAssignment[] = [];
  for (const assignment of event.assignments) {
    const variable = compilation.variables.get(assignment.name)!;
    const compartment = compilation.compartments.get(assignment.name);
    if (!variable.hasSubstanceOnly && compartment) {
      first.push(assignment);
    } else {
      second.push(assignment);
    }
  }

  for (let i = 0; i < first.length + second.length; i++) {
    const { name, metadata } =
      i < first.length ? first[i] : second[i - first.length];

    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_PARAM));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_PARAM));
    }

    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_OUT_PARAM));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_OUT_PARAM));
    } else if (name === TIME_NAME) {
      throw new CompileError("You cannot assign to time.", metadata);
    } else {
      throw new CompileError("Unexpected assignment.", metadata);
    }

    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * yIndices.get(name));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * pIndices.get(name));
    }

    const variable = compilation.variables.get(name)!;
    const compartment = compilation.compartments.get(name);
    if (!variable.hasSubstanceOnly && compartment) {
      scope.emitLoadVariableFromName(emitter, compartment.name);
      emitter.emitUint(OpCode.f64mul);
    }

    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * compilation.yTable.get(name));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * compilation.pTable.get(name));
    }
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};
