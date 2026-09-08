import {
  UPDATE_P_NAME,
  T_PARAM,
  Y_PARAM,
  P_PARAM,
  EVENTS_PARAM,
} from "../../names";
import { OpCode, ValType } from "../codes";
import type { Compilation } from "../Compilation";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "../constants";
import Emitter from "../Emitter";
import { emitExpression } from "../expression";
import type { CompiledFunction } from "../functions";
import type { Assignable } from "../graph";
import { GlobalScope } from "../scope";
import { LocalsSymbolTable, type FunctionTable } from "../symbolTables";

export const getUpdatePFor = (compilation: Compilation): CompiledFunction => ({
  kind: "compile",
  isExported: true,
  name: UPDATE_P_NAME,
  params: [ValType.f64, ValType.i32, ValType.i32, ValType.i32],
  results: [],
  compileBody: (functionTable) =>
    compileUpdateP(compilation, functionTable).getOutput(),
});

export const compileUpdateP = (
  compilation: Compilation,
  functionTable: FunctionTable,
): Emitter => {
  const { assignmentGraph, pTable } = compilation;
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  // no locals
  emitter.emitListHeader(0);

  const assignments = assignmentGraph.getAssignmentOrder(
    compilation.pVars
      .map((name) => ({ kind: "name", name }) as Assignable)
      .concat(
        compilation.yDifferentialVars.map(
          (name) => ({ kind: "rate", name }) as Assignable,
        ),
      )
      .concat(
        Array.from(compilation.reactions.values()).map((r) => ({
          kind: "name",
          name: r.name,
        })),
      ),
  );

  for (const { name, expression } of assignments) {
    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(P_PARAM));
    emitExpression(expression, emitter, scope, { compilation });
    emitter.emitByte(OpCode.f64store);
    emitter.emitUint(MEM_ALIGNMENT);
    emitter.emitUint(SIZEOF_DOUBLE * pTable.get(name));
  }

  emitter.emitByte(OpCode.end);

  return emitter;
};
