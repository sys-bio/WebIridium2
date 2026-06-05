import { P_PARAM, Y_PARAM } from "../names";
import { OpCode, ValType } from "./codes";
import type { Compilation } from "./Compilation";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";
import Emitter from "./Emitter";
import { CompileInvariantError } from "./errors";
import { LocalsSymbolTable } from "./symbolTables";

export const CONVERT_TO_AMOUNTS_PARAMS = [ValType.i32, ValType.i32];
export const CONVERT_TO_AMOUNTS_RESULTS: ValType[] = [];

export const CONVERT_TO_CONCENTRATIONS_PARAMS = [ValType.i32, ValType.i32];
export const CONVERT_TO_CONCENTRATIONS_RESULTS: ValType[] = [];

export const compileConvert = (
  compilation: Compilation,
  toAmounts: boolean,
): Emitter => {
  const { yTable, pTable } = compilation;
  const localsTable = new LocalsSymbolTable([Y_PARAM, P_PARAM]);

  const emitter = new Emitter();

  emitter.emitListHeader(0);

  const emitCompartment = (name: string): void => {
    if (yTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(yTable.get(name) * SIZEOF_DOUBLE);
    } else if (pTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(pTable.get(name) * SIZEOF_DOUBLE);
    } else {
      throw new CompileInvariantError(`Unknown compartment: ${name}.`);
    }
  };

  for (const yVar of compilation.yVars) {
    const compartment = yVar.compartment;
    if (yVar.kind !== "species") continue;
    if (!compartment) continue;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(Y_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(Y_PARAM));

    emitter.emitByte(OpCode.f64load);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(yTable.get(yVar.name) * SIZEOF_DOUBLE);

    emitCompartment(compartment);

    if (toAmounts) {
      emitter.emitByte(OpCode.f64mul);
    } else {
      emitter.emitByte(OpCode.f64div);
    }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(yTable.get(yVar.name) * SIZEOF_DOUBLE);
  }

  for (const pVar of compilation.pVars) {
    const compartment = pVar.compartment;
    if (pVar.kind !== "species") continue;
    if (!compartment) continue;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.f64load);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(pTable.get(pVar.name) * SIZEOF_DOUBLE);

    emitCompartment(compartment);

    if (toAmounts) {
      emitter.emitByte(OpCode.f64mul);
    } else {
      emitter.emitByte(OpCode.f64div);
    }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(pTable.get(pVar.name) * SIZEOF_DOUBLE);
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};
