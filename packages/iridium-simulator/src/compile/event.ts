import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import {
  CompareContext,
  EventAssignmentContext,
  FormulaContext,
  LogicalContext,
  SumContext,
  type AntimonyVisitor,
} from "antimony-language/grammar";
import { emitFormula } from "./formula";
import { IndexSymbolTable, LocalsSymbolTable } from "./symbolTables.ts";
import { OpCode, ValType } from "./codes";
import Emitter, {
  createEmitLoadVariable,
  type EmitLoadVariableFunction,
} from "./Emitter";
import type { AntimonyEvent } from "antimony-language/semantic";
import { CompileError } from "./errors";
import {
  ROOTS_NAME,
  CHECK_EVENTS_NAME,
  P_PARAM,
  T_PARAM,
  TIME_NAME,
  Y_PARAM,
  generateSymbol,
} from "../names";
import type { InternalModel } from "./model";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE, SIZEOF_INT } from "./constants";
import { evaluateBoolean, getAssignmentOrder } from "./evaluate";
import type { WasmFunction } from "./functions";
import type { EventSpec } from "../modelSpec";

const ROOTS_PARAMS = [ValType.f64, ValType.i32, ValType.i32, ValType.i32];
const ROOTS_RESULTS: ValType[] = [];

const CHECK_EVENTS_PARAMS = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
const CHECK_EVENTS_RESULTS: ValType[] = [];

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

/**
 * Represents a condition that an event may be triggered under.
 * The direction indicates what the slope should be when the root is reached.
 *
 * A direction 0 indicates equality, or that both -1 and 1 work.
 *
 * @example
 * ```
 * y > 5 will  be represented as { direction: 1, bytecode: [y - 5] }
 * ```
 */
type EventCondition = {
  direction: -1 | 0 | 1;
  comparison: CompareContext;
};

type InternalEvent = AntimonyEvent & {
  conditions: EventCondition[];
};

const getEventConditionDirection = (ctx: CompareContext): -1 | 0 | 1 => {
  const op = ctx._op.text;
  return op === ">=" || op === ">" ? 1 : op === "<=" || op === "<" ? -1 : 0;
};

// TODO: how do we handle != event?
const compileEventCondition = (
  condition: EventCondition,
  emitter: Emitter,
  emitLoadVariable: EmitLoadVariableFunction,
  functionTable: IndexSymbolTable,
): void => {
  const ctx = condition.comparison;
  const op = ctx._op.text;

  // rewrite the comparison into a root problem
  const subtractionCtx = new SumContext(ctx);
  subtractionCtx._op = {
    ...ctx._op,
    text: "-",
  };
  subtractionCtx.children = ctx.children;

  emitFormula(subtractionCtx, emitter, emitLoadVariable, functionTable);

  if (op === "==" || op === "==") {
    // TODO: fix this
    throw new CompileError("==/!= in events not yet supported.", { tree: ctx });
  }
};

const INVALID_TRIGGER_MESSAGE =
  "Invalid event trigger. Missing comparison or equality.";

class EventConditionCollectorVisitor
  extends AbstractParseTreeVisitor<EventCondition[]>
  implements AntimonyVisitor<EventCondition[]>
{
  constructor() {
    super();
  }

  defaultResult(): EventCondition[] {
    return [];
  }

  aggregateResult(
    aggregate: EventCondition[],
    nextResult: EventCondition[],
  ): EventCondition[] {
    return aggregate.concat(nextResult);
  }

  visitCompare(ctx: CompareContext): EventCondition[] {
    return [
      {
        direction: getEventConditionDirection(ctx),
        comparison: ctx,
      },
    ];
  }

  visitLogical(ctx: LogicalContext): EventCondition[] {
    const conditions: EventCondition[] = [];
    for (let i = 0; i < ctx.childCount; i++) {
      if (i > 1) throw new Error("Complex events not yet supported.");

      const child = ctx.getChild(i);
      if (child instanceof CompareContext) {
        conditions.push({
          direction: getEventConditionDirection(child),
          comparison: child,
        });
      } else {
        throw new CompileError(INVALID_TRIGGER_MESSAGE, { tree: child });
      }
    }
    return conditions;
  }
}

const createInternalEvent = (event: AntimonyEvent): InternalEvent => {
  const visitor = new EventConditionCollectorVisitor();

  const conditions = event.trigger.accept(visitor);
  if (conditions.length === 0) {
    throw new CompileError(INVALID_TRIGGER_MESSAGE, { tree: event.trigger });
  } else if (conditions.length > 1) {
    throw new CompileError("Only one comparison supported.", {
      tree: event.trigger,
    });
  }

  return {
    ...event,
    conditions,
  };
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
      isT0: event.options.t0 ? evaluateBoolean(event.options.t0) : false,
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
          compileRoots(functionTable, model, events).getOutput(),
      },
      {
        kind: "compile",
        isExported: true,
        name: CHECK_EVENTS_NAME,
        params: CHECK_EVENTS_PARAMS,
        results: CHECK_EVENTS_RESULTS,
        compileBody: (_functionTable) => compileCheckEvents(events).getOutput(),
      },
      ...eventFns,
    ],
    eventSpecs,
  };
};

const G_PARAM = "g[]";

const compileRoots = (
  functionTable: IndexSymbolTable,
  model: InternalModel,
  events: InternalEvent[],
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
      emitter.emitUint32(localsTable.getParam(G_PARAM));

      compileEventCondition(
        condition,
        emitter,
        emitLoadVariable,
        functionTable,
      );

      emitter.emitByte(OpCode.f64store);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * currentRootIndex);

      currentRootIndex += 1;
    }
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};

const EVENT_OUT_PARAM = "eventout[]";
const CONDITIONS_PARAM = "conditions[]";
const ROOTS_PARAM = "roots[]";

const compileCheckEvents = (events: InternalEvent[]): Emitter => {
  // TODO: function header

  let currentRootIndex = 0;
  let currentEventIndex = 0;

  const emitter = new Emitter();

  emitter.emitListHeader(0);

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    ROOTS_PARAM,
    CONDITIONS_PARAM,
    EVENT_OUT_PARAM,
  ]);

  for (const trigger of events) {
    const startRootIndex = currentRootIndex;

    for (const { direction, comparison: ctx } of trigger.conditions) {
      // load the root
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(ROOTS_PARAM));

      emitter.emitByte(OpCode.i32load);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_INT * currentRootIndex);

      // check if the root was changed
      emitter.emitByte(OpCode.i32const);
      emitter.emitUint32(0);

      emitter.emitByte(OpCode.i32ne);

      // if so, we need to update our condition array
      emitter.emitByte(OpCode.if);
      emitter.emitByte(OpCode.blockNoType);

      // load the root, check if its the right direction and result in the conditions array
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(CONDITIONS_PARAM));

      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(ROOTS_PARAM));

      emitter.emitByte(OpCode.i32load);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_INT * currentRootIndex);

      emitter.emitByte(OpCode.i32const);
      emitter.emitUint32(0);

      if (direction === 0) {
        // TODO: handle this properly
        throw new CompileError("==/!= in event not yet supported.", {
          tree: ctx,
        });
      } else if (direction > 0) {
        emitter.emitByte(OpCode.i32ge_s);
      } else {
        emitter.emitByte(OpCode.i32le_s);
      }

      emitter.emitByte(OpCode.i32store);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_INT * currentRootIndex);

      emitter.emitByte(OpCode.end);

      currentRootIndex += 1;
    }

    // update the event out
    emitter.emitByte(OpCode.localget);
    emitter.emitUint32(localsTable.getParam(EVENT_OUT_PARAM));

    // TODO: properly handle logical conditions instead of just AND everything
    for (let i = startRootIndex; i < currentRootIndex; i++) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(CONDITIONS_PARAM));

      emitter.emitByte(OpCode.i32load);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_INT * i);

      if (i !== startRootIndex) {
        emitter.emitByte(OpCode.i32and);
      }
    }

    emitter.emitByte(OpCode.i32store);
    emitter.emitUint32(MEM_ALIGNMENT);
    emitter.emitUint32(SIZEOF_INT * currentEventIndex);

    currentEventIndex += 1;
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};

const compileGetOption = (
  model: InternalModel,
  formula: FormulaContext,
  functionTable: IndexSymbolTable,
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
  functionTable: IndexSymbolTable,
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
      emitter.emitUint32(localsTable.getParam(Y_OUT_PARAM));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(P_OUT_PARAM));
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
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * yIndices.get(name));
    } else if (pIndices.has(name)) {
      emitter.emitByte(OpCode.f64store);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * pIndices.get(name));
    }
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};
