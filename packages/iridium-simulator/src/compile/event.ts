import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import {
  CompareContext,
  LogicalContext,
  SumContext,
  type AntimonyVisitor,
} from "antimony-language/grammar";
import { emitFormula } from "./formula";
import { LocalsSymbolTable, type IndexSymbolTable } from "./SymbolTable";
import { OpCode, ValType } from "./codes";
import Emitter, { type EmitLoadVariableFunction } from "./Emitter";
import type { AntimonyEvent } from "antimony-language/semantic";
import { CompileError } from "./errors";
import { TIME_NAME } from "../names";
import type { InternalModel } from "./model";
import { DOUBLE_MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";

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
};

// TODO: how do we handle != event?
const createEventCondition = (
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
      createEventCondition(ctx, this.#emitLoadVariable, this.#functionTable),
    ];
  }

  visitLogical(ctx: LogicalContext): EventCondition[] {
    const conditions: EventCondition[] = [];
    for (let i = 0; i < ctx.childCount; i++) {
      if (i > 1) throw new Error("Complex events not yet supported.");

      const child = ctx.getChild(i);
      if (child instanceof CompareContext) {
        conditions.push(
          createEventCondition(
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

  return { conditions };
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

const T_PARAM = "t";
const Y_PTR_PARAM = "*y";
const G_PTR_PARAM = "*g";
const P_PTR_PARAM = "*p";

export type CompledEventFunctions = {
  rootsFn: Uint8Array;
  checkEventsFn: Uint8Array;
  getDelayFns: Uint8Array[];
  assignFns: Uint8Array[];
};

export const compileEvents = (
  functionTable: IndexSymbolTable,
  model: InternalModel,
): CompledEventFunctions => {
  const [rootsFn, triggers] = compileRoots(functionTable, model);
  return {
    rootsFn: rootsFn.getOutput(),
    checkEventsFn: compileCheckEvents(triggers).getOutput(),
  };
};

const compileRoots = (
  functionTable: IndexSymbolTable,
  model: InternalModel,
): [Emitter, InternalEvent[]] => {
  const { yTable, pTable } = model;
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PTR_PARAM,
    G_PTR_PARAM,
    P_PTR_PARAM,
  ]);

  const emitLoadVariable = (emitter: Emitter, name: string): void => {
    if (name === TIME_NAME) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(T_PARAM));
    } else if (pTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(P_PTR_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * pTable.get(name));
    } else if (yTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(Y_PTR_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * yTable.get(name));
    } else {
      throw new Error(`Unbound name: ${name}`);
    }
  };

  // no locals
  emitter.emitListHeader(0);

  const triggers = getTriggersFromModel(model, emitLoadVariable, functionTable);

  let currentRootIndex = 0;

  for (const trigger of triggers) {
    for (const { bytecode } of trigger.conditions) {
      emitter.appendBytes(bytecode);

      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(G_PTR_PARAM));

      emitter.emitByte(OpCode.f64store);
      emitter.emitUint32(DOUBLE_MEM_ALIGNMENT);
      emitter.emitUint32(SIZEOF_DOUBLE * currentRootIndex);

      currentRootIndex += 1;
    }
  }

  return [emitter, triggers];
};

const EVENT_OUT_PARAM = "*eventout";
const ROOTS_PARAM = "*roots";

const compileCheckEvents = (triggers: InternalEvent[]): Emitter => {
  let currentRootIndex = 0;
  let currentEventIndex = 0;

  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PTR_PARAM,
    ROOTS_PARAM,
    EVENT_OUT_PARAM,
  ]);

  for (const trigger of triggers) {
    for (const { direction } of trigger.conditions) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint32(localsTable.getParam(ROOTS_PARAM));

      if (direction === 0) {
        // TODO: how do we handle != ??
      } else {
      }

      currentRootIndex += 1;
    }

    currentEventIndex += 1;
  }

  return emitter;
};
