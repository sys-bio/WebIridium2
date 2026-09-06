import { ValType, OpCode } from "../codes";
import Emitter from "../Emitter";
import { FunctionTable, LocalsSymbolTable } from "../symbolTables.ts";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "../constants";
import { EVENTS_PARAM, P_PARAM, T_PARAM, Y_PARAM } from "../../names";
import type { Compilation } from "../Compilation.ts";
import { GlobalScope } from "../scope.ts";
import { emitExpression } from "../expression.ts";
import type { Name } from "../graph.ts";

const YDOT_PTR_PARAM = "ydot[]";

export const RHS_PARAMS: ValType[] = [
  ValType.f64,
  ValType.i32,
  ValType.i32,
  ValType.i32,
  ValType.i32,
];
export const RHS_RESULTS: ValType[] = [ValType.i32];

export const compileRhs = (
  compilation: Compilation,
  functionTable: FunctionTable,
): Emitter => {
  const { assignmentGraph, yTable, pTable } = compilation;
  const emitter = new Emitter();

  const RATE_TMP = "rate_tmp";
  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    YDOT_PTR_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);

  localsTable.addLocal(RATE_TMP);

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  emitter.emitListHeader(1);

  // 1 local for RATE_TMP
  emitter.emitUint(1);
  emitter.emitByte(ValType.f64);

  const assignments = assignmentGraph.getAssignmentOrder(
    compilation.yVars
      .map((name) => ({ kind: "rate", name }))
      .concat(compilation.pVars.map((name) => ({ kind: "name", name })))
      .concat(
        Array.from(compilation.reactions.values()).map((r) => ({
          kind: "name",
          name: r.name,
        })),
      ) as Name[],
  );

  for (const { kind, name, expression } of assignments) {
    switch (kind) {
      case "name":
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(P_PARAM));
        emitExpression(expression, emitter, scope, { compilation });
        emitter.emitByte(OpCode.f64store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_DOUBLE * pTable.get(name));
        break;
      case "rate":
        emitExpression(expression, emitter, scope, { compilation });

        emitter.emitByte(OpCode.localset);
        emitter.emitUint(localsTable.getLocal(RATE_TMP));

        // store it in the ydot
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(YDOT_PTR_PARAM));

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(RATE_TMP));

        emitter.emitByte(OpCode.f64store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_DOUBLE * yTable.get(name));

        // store it in the p
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(P_PARAM));

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(RATE_TMP));

        emitter.emitByte(OpCode.f64store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_DOUBLE * pTable.get(name));
        break;
    }
  }

  emitter.emitI32ConstOp(0);

  emitter.emitByte(OpCode.end);

  return emitter;
};
