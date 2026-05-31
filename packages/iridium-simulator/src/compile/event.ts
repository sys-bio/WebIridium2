import {
  CompareContext,
  EventAssignmentContext,
  FormulaContext,
  LogicalContext,
  type AntimonyListener,
} from "antimony-language/grammar";
import { emitComparisonOperator, emitFormula } from "./formula";
import {
  FunctionTable,
  IndexSymbolTable,
  LocalsSymbolTable,
} from "./symbolTables.ts";
import { OpCode, ValType } from "./codes";
import Emitter, {
  createEmitLoadVariable,
  type EmitLoadVariableFunction,
} from "./Emitter";
import type { AntimonyEvent } from "antimony-language/semantic";
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
} from "../names";
import type { InternalModel } from "./model";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE, SIZEOF_INT } from "./constants";
import { evaluateBoolean, getAssignmentOrder } from "./evaluate";
import type { WasmFunction } from "./functions";
import type { EventSpec } from "../modelSpec";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import type { ParserRuleContext } from "antlr4ts";
import { WASM_FALSE, WASM_TRUE } from "./wasmTypes.ts";

const ROOTS_PARAMS = [ValType.f64, ValType.i32, ValType.i32, ValType.i32];
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

const GET_OPTION_PARAMS = [ValType.f64, ValType.i32, ValType.i32];
const GET_OPTION_RESULTS = [ValType.f64];

const GET_ASSIGNMENTS_PARAMS = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const GET_ASSIGNMENTS_RESULTS: ValType[] = [];

type ComparisonOperator = ">" | ">=" | "<" | "<=" | "==" | "!=";

type EventCondition = {
  op: ComparisonOperator;
  left: FormulaContext;
  right: FormulaContext;
};

type LogicOperationTree =
  | number
  | { kind: "or"; left: LogicOperationTree; right: LogicOperationTree }
  | { kind: "and"; left: LogicOperationTree; right: LogicOperationTree }
  | { kind: "not"; child: LogicOperationTree };

type InternalEvent = AntimonyEvent & {
  conditions: EventCondition[];
  tree: LogicOperationTree;
};

const emitEventConditionAsRoot = (
  condition: EventCondition,
  emitter: Emitter,
  emitLoadVariable: EmitLoadVariableFunction,
  functionTable: FunctionTable,
): void => {
  emitFormula(condition.left, emitter, emitLoadVariable, functionTable);
  emitFormula(condition.right, emitter, emitLoadVariable, functionTable);
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
  if (condition.op === ">") {
    emitter.emitF64ConstOp(Number.EPSILON);
    emitter.emitByte(OpCode.f64sub);
  } else if (condition.op === "<") {
    emitter.emitF64ConstOp(Number.EPSILON);
    emitter.emitByte(OpCode.f64add);
  }
};

// TODO: how to handle something like x + (x < 5)
class EventConditionListener implements AntimonyListener {
  #treeStack: LogicOperationTree[];
  #conditions: EventCondition[];

  constructor() {
    this.#treeStack = [];
    this.#conditions = [];
  }

  getResult(): {
    tree: LogicOperationTree;
    conditions: EventCondition[];
  } | null {
    if (this.#treeStack.length !== 1) {
      return null;
    } else {
      return {
        tree: this.#treeStack.pop() as LogicOperationTree,
        conditions: this.#conditions,
      };
    }
  }

  #pushBinaryLogicalOp(ctx: ParserRuleContext, kind: "and" | "or"): void {
    const right = this.#treeStack.pop();
    const left = this.#treeStack.pop();
    if (left === undefined || right === undefined) {
      throw new CompileError(
        "Invalid event trigger. Must evaluate to boolean.",
        { tree: ctx },
      );
    }
    this.#treeStack.push({ kind, left, right });
  }

  exitLogical(ctx: LogicalContext): void {
    const op = ctx._op.text;
    if (op === "&&") {
      this.#pushBinaryLogicalOp(ctx, "and");
    } else if (op === "||") {
      this.#pushBinaryLogicalOp(ctx, "or");
    }
  }

  exitCompare(ctx: CompareContext): void {
    const op = ctx._op.text as ComparisonOperator;
    const left = ctx.getChild(0, FormulaContext);

    this.#treeStack.push(this.#conditions.length);

    // It's left recursive. We want to split things like `(((0 < x) < 5) == 5)` into `0 < x && x < 5 && 5 == 5`
    if (left instanceof CompareContext) {
      const leftRight = left.getChild(1, FormulaContext);
      // TODO: what if someone does `0 < (x < 5)`? Should this be allowed?
      this.#conditions.push({
        op: op,
        left: leftRight,
        right: ctx.getChild(1, FormulaContext),
      });
      this.#pushBinaryLogicalOp(ctx, "and");
    } else {
      if (op === "!=") {
        this.#treeStack.push({
          kind: "not",
          child: this.#treeStack.pop() as LogicOperationTree,
        });
      }

      this.#conditions.push({
        op: op,
        left: ctx.getChild(0, FormulaContext),
        right: ctx.getChild(1, FormulaContext),
      });
    }
  }
}

const createInternalEvent = (event: AntimonyEvent): InternalEvent => {
  const listener = new EventConditionListener();
  ParseTreeWalker.DEFAULT.walk(listener as ParseTreeListener, event.trigger);

  const result = listener.getResult();
  if (!result) {
    throw new CompileError("Invalid event trigger. Must evaluate to boolean.", {
      tree: event.trigger,
    });
  } else {
    return {
      ...event,
      conditions: result.conditions,
      tree: result.tree,
    };
  }
};

export const compileEvents = (
  model: InternalModel,
): { functions: WasmFunction[]; eventSpecs: EventSpec[] } => {
  const events = model.events.map(createInternalEvent);
  const eventSpecs: EventSpec[] = [];
  const eventFns: WasmFunction[] = [];

  for (const event of events) {
    const yIndices = new IndexSymbolTable();
    const pIndices = new IndexSymbolTable();

    for (const [name, formula] of event.assignments) {
      if (model.yTable.has(name)) {
        yIndices.add(name);
      } else if (model.pTable.has(name)) {
        pIndices.add(name);
      } else if (name === TIME_NAME) {
        throw new CompileError("You cannot assign to time.", {
          tree: formula.parent,
        });
      } else {
        throw new CompileError(`Unbound name: ${name}`, {
          tree: (
            formula?.parent as EventAssignmentContext | undefined
          )?.variable?.(),
        });
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
            model,
            event.delay as FormulaContext,
            functionTable,
          ).getOutput(),
      });
    }

    if (event.options.priority) {
      getPriorityExport = generateSymbol("getPriority");
      eventFns.push({
        kind: "compile",
        isExported: true,
        name: getPriorityExport,
        params: GET_OPTION_PARAMS,
        results: GET_OPTION_RESULTS,
        compileBody: (functionTable) =>
          compileGetOption(
            model,
            event.options.priority as FormulaContext,
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
          model,
          event,
          yIndices,
          pIndices,
          functionTable,
        ).getOutput(),
    });

    eventSpecs.push({
      getAssignmentsExport,
      getDelayExport,
      getPriorityExport,
      countRoots: event.conditions.length,

      // These are actually a different set of indices.
      // We start with maybe some variables: A, B, C
      // In the getAssignments function we are given a double[3] array.
      // We pick [A: 1, B: 2, C: 3]
      // Then let's say the index of A in the model is 2, B is 4, C is 10
      // In the EventSpec, we say [1: 2, 2: 4, 3: 10]
      // Now when someone else reads the double[3] array, they know the first
      yIndices: yIndices.keys().map((y) => model.yTable.get(y)),
      pIndices: pIndices.keys().map((p) => model.pTable.get(p)),

      isPersistent: event.options.persistent
        ? evaluateBoolean(event.options.persistent)
        : true,
      isFromTrigger: event.options.fromTrigger
        ? evaluateBoolean(event.options.fromTrigger)
        : true,
      isT0: event.options.t0 ? evaluateBoolean(event.options.t0) : true,
    });
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
          compileRoots(model, events, functionTable).getOutput(),
      },
      {
        kind: "compile",
        isExported: true,
        name: CHECK_ROOTS_NAME,
        params: CHECK_ROOTS_PARAMS,
        results: CHECK_ROOTS_RESULTS,
        compileBody: (functionTable) =>
          compileCheckRoots(model, events, functionTable).getOutput(),
      },
      {
        kind: "compile",
        isExported: true,
        name: UPDATE_CONDITIONS_NAME,
        params: UPDATE_CONDITIONS_PARAMS,
        results: UPDATE_CONDITIONS_RESULTS,
        compileBody: (functionTable) =>
          compileUpdateConditions(model, events, functionTable).getOutput(),
      },
      ...eventFns,
    ],
    eventSpecs,
  };
};

const G_PARAM = "g[]";

const compileRoots = (
  model: InternalModel,
  events: InternalEvent[],
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    G_PARAM,
    P_PARAM,
  ]);

  // no locals
  emitter.emitListHeader(0);

  const emitLoadVariable = createEmitLoadVariable(model, localsTable);

  let currentRootIndex = 0;

  for (const event of events) {
    for (const condition of event.conditions) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(G_PARAM));

      emitEventConditionAsRoot(
        condition,
        emitter,
        emitLoadVariable,
        functionTable,
      );

      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * currentRootIndex);

      currentRootIndex += 1;
    }
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};

const EVENT_OUT_PARAM = "eventout[]";
const CONDITIONS_PARAM = "conditions[]";
const ROOTS_PARAM = "roots[]";

const emitLogicOperationTree = (
  tree: LogicOperationTree,
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
  } else if (tree.kind === "and") {
    emitLogicOperationTree(tree.left, emitter, localsTable, startRootIndex);
    emitLogicOperationTree(tree.right, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32and);
  } else if (tree.kind === "or") {
    emitLogicOperationTree(tree.left, emitter, localsTable, startRootIndex);
    emitLogicOperationTree(tree.right, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32or);
  } else if (tree.kind === "not") {
    emitLogicOperationTree(tree.child, emitter, localsTable, startRootIndex);
    emitter.emitByte(OpCode.i32eqz);
  }
};

const compileCheckRoots = (
  model: InternalModel,
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
    EVENT_OUT_PARAM,
  ]);

  const emitLoadVariable = createEmitLoadVariable(model, localsTable);

  let currentRootIndex = 0;
  let currentEventIndex = 0;

  for (const event of events) {
    const startRootIndex = currentRootIndex;

    for (const condition of event.conditions) {
      if (condition.op === "==" || condition.op === "!=") {
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
            if (condition.op === "!=") {
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

            emitFormula(
              condition.left,
              emitter,
              emitLoadVariable,
              functionTable,
            );
            emitFormula(
              condition.right,
              emitter,
              emitLoadVariable,
              functionTable,
            );
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

          if (condition.op === ">=" || condition.op === ">") {
            emitter.emitI32ConstOp(0);
            emitter.emitByte(OpCode.i32ge_s);
          } else if (condition.op === "<=" || condition.op === "<") {
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
    emitter.emitUint(localsTable.getParam(EVENT_OUT_PARAM));

    emitLogicOperationTree(event.tree, emitter, localsTable, startRootIndex);

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
  model: InternalModel,
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
    EVENT_OUT_PARAM,
  ]);

  localsTable.addLocal(LEFT_LOCAL);
  localsTable.addLocal(RIGHT_LOCAL);
  localsTable.addLocal(SHOULD_SKIP_EVENT_LOCAL);

  const emitLoadVariable = createEmitLoadVariable(model, localsTable);

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
      if (condition.op === ">" || condition.op === "<") {
        emitFormula(condition.left, emitter, emitLoadVariable, functionTable);
        emitter.emitByte(OpCode.localset);
        emitter.emitUint(localsTable.getLocal(LEFT_LOCAL));

        emitFormula(condition.right, emitter, emitLoadVariable, functionTable);
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
            emitter.emitI32ConstOp(WASM_TRUE);

            emitter.emitByte(OpCode.localset);
            emitter.emitByte(localsTable.getLocal(SHOULD_SKIP_EVENT_LOCAL));

            // It's OK to set the condition to false because at the boundary it is not true yet.
            // If the root-finding function hits it, this will update as required.
            emitter.emitByte(OpCode.localget);
            emitter.emitUint(localsTable.getParam(CONDITIONS_PARAM));

            emitter.emitI32ConstOp(WASM_FALSE);

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

        emitFormula(condition.left, emitter, emitLoadVariable, functionTable);
        emitFormula(condition.right, emitter, emitLoadVariable, functionTable);
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
        // reset the flag if we need to skip
        emitter.emitI32ConstOp(WASM_FALSE);

        emitter.emitByte(OpCode.localset);
        emitter.emitUint(localsTable.getLocal(SHOULD_SKIP_EVENT_LOCAL));
      },
      () => {
        // update the event out
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(EVENT_OUT_PARAM));

        emitLogicOperationTree(
          event.tree,
          emitter,
          localsTable,
          startRootIndex,
        );

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
  model: InternalModel,
  formula: FormulaContext,
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([T_PARAM, Y_PARAM, P_PARAM]);

  emitter.emitListHeader(0);

  const emitLoadVariable = createEmitLoadVariable(model, localsTable);
  emitFormula(formula, emitter, emitLoadVariable, functionTable);

  emitter.emitByte(OpCode.end);

  return emitter;
};

const Y_OUT_PARAM = "yout[]";
const P_OUT_PARAM = "pout[]";

const compileGetAssignments = (
  model: InternalModel,
  event: InternalEvent,
  yIndices: IndexSymbolTable,
  pIndices: IndexSymbolTable,
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    Y_OUT_PARAM,
    P_OUT_PARAM,
  ]);

  emitter.emitListHeader(0);

  const ordering = getAssignmentOrder(event.assignments, {
    allowSelfCycle: true,
  });
  const emitLoadVariable = createEmitLoadVariable(model, localsTable);

  for (const name of ordering) {
    const formula = event.assignments.get(name)!;

    if (yIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_OUT_PARAM));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_OUT_PARAM));
    } else if (name === TIME_NAME) {
      throw new CompileError("You cannot assign to time.", {
        tree: formula.parent,
      });
    } else {
      throw new CompileError("Unexpected assignment.", {
        tree: (
          formula?.parent as EventAssignmentContext | undefined
        )?.variable?.(),
      });
    }

    emitFormula(formula, emitter, emitLoadVariable, functionTable);

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
