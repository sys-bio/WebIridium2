import {
  CONVERT_RESET_NAME,
  CONVERT_TO_AMOUNTS_NAME,
  CONVERT_TO_CONCENTRATIONS_NAME,
  P_PARAM,
  Y_PARAM,
} from "../../names";
import { OpCode, ValType } from "../codes";
import type { Compilation } from "../Compilation";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "../constants";
import Emitter from "../Emitter";
import { CompileInvariantError } from "../errors";
import type { CompiledFunction } from "../functions";
import { LocalsSymbolTable } from "../symbolTables";

const CONVERT_PARAMS = [ValType.i32, ValType.i32];
const CONVERT_RESULTS: ValType[] = [];

export const getConvertConcentrationFunctions = (
  compilation: Compilation,
): CompiledFunction[] => [
  {
    kind: "compile",
    isExported: true,
    name: CONVERT_TO_AMOUNTS_NAME,
    params: CONVERT_PARAMS,
    results: CONVERT_RESULTS,
    compileBody: (_functionTable) =>
      compileConvert(compilation, "toAmount").getOutput(),
  },
  {
    kind: "compile",
    isExported: true,
    name: CONVERT_TO_CONCENTRATIONS_NAME,
    params: CONVERT_PARAMS,
    results: CONVERT_RESULTS,
    compileBody: (_functionTable) =>
      compileConvert(compilation, "toConcentrations").getOutput(),
  },
  {
    kind: "compile",
    isExported: true,
    name: CONVERT_RESET_NAME,
    params: CONVERT_PARAMS,
    results: CONVERT_RESULTS,
    compileBody: (_functionTable) =>
      compileConvert(compilation, "reset").getOutput(),
  },
];

/**
 * @param mode - what kind of conversion we are doing
 *  - toAmount is used at the start of the simulation.
 *  - toConcentrations is used for output.
 *  - reset is used at the end of the simulation.
 */
const compileConvert = (
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

  for (const yVarName of compilation.yDifferentialVars.concat(
    compilation.yAlgebraicVars,
  )) {
    const yVar = compilation.variables.get(yVarName)!;
    const compartment = compilation.compartments.get(yVarName);
    if (!compartment) continue;
    if (mode === "toAmount" && yVar.hasSubstanceOnly) continue;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(Y_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(Y_PARAM));

    emitter.emitByte(OpCode.f64load);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(yTable.get(yVar.name) * SIZEOF_DOUBLE);

    emitCompartment(compartment.name);

    if (mode == "toAmount") {
      emitter.emitByte(OpCode.f64mul);
    } else {
      emitter.emitByte(OpCode.f64div);
    }

    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(yTable.get(yVar.name) * SIZEOF_DOUBLE);
  }

  for (const pVarName of compilation.pVars) {
    const pVar = compilation.variables.get(pVarName)!;
    const compartment = compilation.compartments.get(pVarName);
    if (!compartment) continue;
    if (mode === "toAmount" && pVar.hasSubstanceOnly) continue;

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));

    emitter.emitByte(OpCode.f64load);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(pTable.get(pVar.name) * SIZEOF_DOUBLE);

    emitCompartment(compartment.name);

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
