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
import { IndexSymbolTable, LocalsSymbolTable } from "./SymbolTable";
import { OpCode, ValType } from "./codes";
import Emitter, {
  createEmitLoadVariable,
  type EmitLoadVariableFunction,
} from "./Emitter";
import type { AntimonyEvent } from "antimony-language/semantic";
import { CompileError } from "./errors";
import { P_PARAM, T_PARAM, TIME_NAME, Y_PARAM } from "../names";
import type { InternalModel } from "./model";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE, SIZEOF_INT } from "./constants";
import { getAssignmentOrder } from "./evaluate";

export const ROOTS_PARAMS = [ValType.i32, ValType.i32, ValType.i32];
export const ROOTS_RESULTS = [ValType.i32];

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
  bytecode: Uint8Array;
};

type InternalEvent = {
  conditions: EventCondition[];
  assignments: Map<string, FormulaContext>;
  delay?: FormulaContext;
};

// TODO: how do we handle != event?
const compileEventCondition = (
  ctx: CompareContext,
  emitLoadVariable: EmitLoadVariableFunction,
  functionTable: IndexSymbolTable,
): EventCondition => {
  const op = ctx._op.text;
  const emitter = new Emitter();

  // rewrite the comparison into a root problem
  const newCtx = new SumContext(ctx);
  newCtx._op = {
    ...ctx._op,
    text: "-",
  };

  emitFormula(newCtx, emitter, emitLoadVariable, functionTable);

  if (op === "!=") {
    // TODO: fix this
    throw new CompileError("!= in events not yet supported.", { tree: ctx });
  }

  return {
    direction:
      op === ">=" || op === ">" ? 1 : op === "<=" || op === "<" ? -1 : 0,
    bytecode: emitter.getOutput(),
  };
};

const INVALID_TRIGGER_MESSAGE =
  "Invalid event trigger. Missing comparison or equality.";

class EventCompilerVisitor
  extends AbstractParseTreeVisitor<EventCondition[]>
  implements AntimonyVisitor<EventCondition[]>
{
  #emitLoadVariable: EmitLoadVariableFunction;
  #functionTable: IndexSymbolTable;

  constructor(
    emitLoadVariable: EmitLoadVariableFunction,
    functionTable: IndexSymbolTable,
  ) {
    super();
    this.#emitLoadVariable = emitLoadVariable;
    this.#functionTable = functionTable;
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
      compileEventCondition(ctx, this.#emitLoadVariable, this.#functionTable),
    ];
  }

  visitLogical(ctx: LogicalContext): EventCondition[] {
    const conditions: EventCondition[] = [];
    for (let i = 0; i < ctx.childCount; i++) {
      if (i > 1) throw new Error("Complex events not yet supported.");

      const child = ctx.getChild(i);
      if (child instanceof CompareContext) {
        conditions.push(
          compileEventCondition(
            child,
            this.#emitLoadVariable,
            this.#functionTable,
          ),
        );
      } else {
        throw new CompileError(INVALID_TRIGGER_MESSAGE, { tree: child });
      }
    }
    return conditions;
  }
}

const getTrigger = (
  event: AntimonyEvent,
  emitLoadVariable: EmitLoadVariableFunction,
  functionTable: IndexSymbolTable,
): InternalEvent => {
  const visitor = new EventCompilerVisitor(emitLoadVariable, functionTable);

  const conditions = event.trigger.accept(visitor);
  if (conditions.length === 0) {
    throw new CompileError(INVALID_TRIGGER_MESSAGE, { tree: event.trigger });
  } else if (conditions.length > 1) {
    throw new CompileError("Only one comparison supported.", {
      tree: event.trigger,
    });
  }

  return {
    conditions,
    assignments: event.assignments,
    delay: event.delay,
  };
};

export const getTriggersFromModel = (
  model: InternalModel,
  emitLoadVariable: EmitLoadVariableFunction,
  functionTable: IndexSymbolTable,
): InternalEvent[] => {
  const triggers: InternalEvent[] = [];

  for (const event of model.events) {
    triggers.push(getTrigger(event, emitLoadVariable, functionTable));
  }

  return triggers;
};

const G_PARAM = "g[]";

export type CompiledEvent = {
  countRoots: number;
  yIndices: number[];
  pIndices: number[];
  getDelayFn: Uint8Array;
  getAssignmentsFn: Uint8Array;
};

export type CompiledEvents = {
  rootsFn: Uint8Array;
  checkEventsFn: Uint8Array;
  events: CompiledEvent[];
};

export const compileEvents = (
  functionTable: IndexSymbolTable,
  model: InternalModel,
): CompiledEvents => {
  const [rootsFn, events] = compileRoots(functionTable, model);
  const checkEventsFn = compileCheckEvents(events);
  const compiledEvents: CompiledEvent[] = [];

  for (const event of events) {
    const getDelayFn = compileGetDelay(model, event, functionTable);
    const {
      emitter: getAssignmentsFn,
      yOutTable,
      pOutTable,
    } = compileGetAssignments(model, event, functionTable);
    compiledEvents.push({
      getDelayFn: getDelayFn.getOutput(),
      getAssignmentsFn: getAssignmentsFn.getOutput(),
      yIndices: yOutTable.values(),
      pIndices: pOutTable.values(),
      countRoots: event.conditions.length,
    });
  }

  return {
    rootsFn: rootsFn.getOutput(),
    checkEventsFn: checkEventsFn.getOutput(),
    events: compiledEvents,
  };
};

const compileRoots = (
  functionTable: IndexSymbolTable,
  model: InternalModel,
): [Emitter, InternalEvent[]] => {
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

  const triggers = getTriggersFromModel(model, emitLoadVariable, functionTable);

  let currentRootIndex = 0;

  for (const trigger of triggers) {
    for (const { bytecode } of trigger.conditions) {
      emitter.appendBytes(bytecode);

      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(G_PARAM));

      emitter.emitByte(OpCode.f64store);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * currentRootIndex);

      currentRootIndex += 1;
    }
  }

  return [emitter, triggers];
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
    EVENT_OUT_PARAM,
  ]);

  for (const trigger of events) {
    const startRootIndex = currentRootIndex;

    for (const { direction } of trigger.conditions) {
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

      if (direction === 0) {
        // TODO: handle this properly
        throw new CompileError("== in event not yet supported.");
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

  return emitter;
};

const compileGetDelay = (
  model: InternalModel,
  event: InternalEvent,
  functionTable: IndexSymbolTable,
): Emitter => {
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([T_PARAM, Y_PARAM, P_PARAM]);

  emitter.emitListHeader(0);

  if (event.delay) {
    const emitLoadVariable = createEmitLoadVariable(model, localsTable);
    emitFormula(event.delay, emitter, emitLoadVariable, functionTable);
  } else {
    emitter.emitByte(OpCode.f64const);
    emitter.emitFloat64(0);
  }

  return emitter;
};

const Y_OUT_PARAM = "y_out[]";
const P_OUT_PARAM = "p_out[]";

const compileGetAssignments = (
  model: InternalModel,
  event: InternalEvent,
  functionTable: IndexSymbolTable,
): {
  emitter: Emitter;
  yOutTable: IndexSymbolTable;
  pOutTable: IndexSymbolTable;
} => {
  const { yTable, pTable } = model;

  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    Y_OUT_PARAM,
    P_OUT_PARAM,
  ]);

  const yOutTable = new IndexSymbolTable();
  const pOutTable = new IndexSymbolTable();

  emitter.emitListHeader(0);

  const ordering = getAssignmentOrder(event.assignments);
  const emitLoadVariable = createEmitLoadVariable(model, localsTable);

  for (const name of ordering) {
    const formula = event.assignments.get(name)!;

    emitFormula(formula, emitter, emitLoadVariable, functionTable);

    if (yTable.has(name)) {
      yOutTable.add(name);

      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(Y_OUT_PARAM));

      emitter.emitByte(OpCode.f64store);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * yOutTable.get(name));
    } else if (pTable.has(name)) {
      pOutTable.add(name);

      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(P_OUT_PARAM));

      emitter.emitByte(OpCode.f64store);
      emitter.emitUint32(MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * pOutTable.get(name));
    } else if (name === TIME_NAME) {
      throw new CompileError("You cannot assign to time.", {
        tree: formula.parent,
      });
    } else {
      throw new CompileError("Unbound name.", {
        tree: (
          formula?.parent as EventAssignmentContext | undefined
        )?.variable?.(),
      });
    }
  }

  return { emitter, yOutTable, pOutTable };
};
