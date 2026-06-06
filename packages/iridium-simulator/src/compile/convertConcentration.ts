import { P_PARAM, Y_PARAM } from "../names";
import { OpCode, ValType } from "./codes";
import type { Compilation } from "./Compilation";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";
import Emitter from "./Emitter";
import { CompileInvariantError } from "./errors";
import { LocalsSymbolTable } from "./symbolTables";

export const CONVERT_PARAMS = [ValType.i32, ValType.i32];
export const CONVERT_RESULTS: ValType[] = [];
/**
 * @param mode - what kind of conversion we are doing
 *  - toAmount is used at the start of the simulation.
 *  - toConcentrations is used for output.
 *  - reset is used at the end of the simulation.
 */
export const compileConvert = (
  compilation: Compilation,
  mode: "toAmount" | "toConcentrations" | "reset",
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
    if (yVar.kind !== "species" || !compartment) continue;
    if (mode === "toAmount" && yVar.hasSubstanceOnly) continue;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(Y_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(Y_PARAM));

    emitter.emitByte(OpCode.f64load);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(yTable.get(yVar.name) * SIZEOF_DOUBLE);

    emitCompartment(compartment);

    if (mode == "toAmount") {
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
    if (pVar.kind !== "species" || !compartment) continue;
    if (mode === "toAmount" && pVar.hasSubstanceOnly) continue;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.f64load);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(pTable.get(pVar.name) * SIZEOF_DOUBLE);

    emitCompartment(compartment);

    if (mode === "toAmount") {
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
