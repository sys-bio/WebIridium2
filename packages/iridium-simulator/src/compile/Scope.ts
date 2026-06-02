import {
  ConstantContext,
  NameContext,
  SubvariableContext,
  type VariableContext,
} from "antimony-language/grammar";
import type { Compilation } from "./Compilation";
import { CompileError, CompileInvariantError } from "./errors";
import type { FunctionTable, LocalsSymbolTable } from "./symbolTables";
import { EVENTS_PARAM, P_PARAM, T_PARAM, TIME_NAME, Y_PARAM } from "../names";
import type Emitter from "./Emitter";
import { OpCode } from "./codes";
import { builtinConstants } from "antimony-language/semantic/builtins";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";

export const getVariableName = (ctx: VariableContext): string => {
  if (ctx instanceof NameContext) {
    return ctx.NAME().text;
  } else if (ctx instanceof SubvariableContext) {
    throw new CompileError("Subvariables not yet supported here.", {
      tree: ctx,
    });
  } else if (ctx instanceof ConstantContext) {
    return getVariableName(ctx.variable());
  } else {
    throw new CompileInvariantError(`unknown variable type: ${ctx.text}`);
  }
};

export class Scope {
  #compilation: Compilation;
  localsTable: LocalsSymbolTable;
  functionTable: FunctionTable;

  /**
   * localsTable should have T_PARAM, Y_PARAM, P_PARAM, EVENTS_PARAM.
   */
  constructor(
    compilation: Compilation,
    localsTable: LocalsSymbolTable,
    functionTable: FunctionTable,
  ) {
    if (!localsTable.hasParam(T_PARAM))
      throw new CompileInvariantError("Missing T_PARAM.");
    if (!localsTable.hasParam(Y_PARAM))
      throw new CompileInvariantError("Missing Y_PARAM.");
    if (!localsTable.hasParam(P_PARAM))
      throw new CompileInvariantError("Missing P_PARAM.");
    if (!localsTable.hasParam(EVENTS_PARAM))
      throw new CompileInvariantError("Missing EVENTS_PARAM.");

    this.#compilation = compilation;
    this.localsTable = localsTable;
    this.functionTable = functionTable;
  }

  emitLoadVariable(emitter: Emitter, ctx: VariableContext): void {
    const name = getVariableName(ctx);
    if (name === TIME_NAME) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(T_PARAM));
    } else if (Object.hasOwn(builtinConstants, name)) {
      emitter.emitByte(OpCode.f64const);
      emitter.emitFloat64(builtinConstants[name].value);
    } else if (this.#compilation.pTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(P_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * this.#compilation.pTable.get(name));
    } else if (this.#compilation.yTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(Y_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * this.#compilation.yTable.get(name));
    } else {
      throw new CompileError(`Unbound name: ${name}`, { tree: ctx });
    }
  }
}
