import { ValType, OpCode } from "../codes";
import Emitter from "../Emitter";
import { FunctionTable, LocalsSymbolTable } from "../symbolTables.ts";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "../constants";
import {
  EVENTS_PARAM,
  P_PARAM,
  RES_NAME,
  RHS_NAME,
  T_PARAM,
  Y_PARAM,
  YDOT_PARAM,
} from "../../names";
import type { Compilation } from "../Compilation.ts";
import { GlobalScope } from "../scope.ts";
import { emitExpression } from "../expression.ts";
import type { CompiledFunction } from "../functions.ts";
import { CompileModelError } from "../errors.ts";
import type { Assignable } from "../graph.ts";

export const getRhsFor = (compilation: Compilation): CompiledFunction => ({
  kind: "compile",
  isExported: true,
  name: RHS_NAME,
  params: [ValType.f64, ValType.i32, ValType.i32, ValType.i32, ValType.i32],
  results: [ValType.i32],
  compileBody: (functionTable) =>
    compileRhs(compilation, functionTable).getOutput(),
});

export const getResFor = (compilation: Compilation): CompiledFunction => ({
  kind: "compile",
  isExported: true,
  name: RES_NAME,
  params: [
    ValType.f64,
    ValType.i32,
    ValType.i32,
    ValType.i32,
    ValType.i32,
    ValType.i32,
  ],
  results: [ValType.i32],
  compileBody: (functionTable) =>
    compileRes(compilation, functionTable).getOutput(),
});

const compileRhs = (
  compilation: Compilation,
  functionTable: FunctionTable,
): Emitter => {
  const { assignmentGraph, yTable, pTable } = compilation;
  const emitter = new Emitter();

  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    YDOT_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  // no locals
  emitter.emitListHeader(0);

  const assignments = assignmentGraph.getAssignmentOrder(
    compilation.yDifferentialVars.map((name) => ({ kind: "rate", name })),
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
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(YDOT_PARAM));
        emitExpression(expression, emitter, scope, { compilation });
        emitter.emitByte(OpCode.f64store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_DOUBLE * yTable.get(name));
        break;
    }
  }

  emitter.emitI32ConstOp(0);

  emitter.emitByte(OpCode.end);

  return emitter;
};

const RESIDUAL_PARAM = "residualout[]";

// TODO: plz change
// hide the ydot param from GlobalScope so it doesn't try to read rateOf from there
// (it should do it from p)
const UGLY_HACK_TODO_CHANGE_YDOT_PARAM = "ydot2[]";

const compileRes = (
  compilation: Compilation,
  functionTable: FunctionTable,
): Emitter => {
  if (compilation.algebraicRules.length > compilation.yAlgebraicVars.length) {
    throw new CompileModelError(
      "System is overdetermined. There are more algebraic rules than algebraic variables.",
    );
  } else if (
    compilation.yAlgebraicVars.length > compilation.algebraicRules.length
  ) {
    throw new CompileModelError(
      "System is underdetermined. There are more algebraic variables than algebraic rules.",
    );
  }

  const { assignmentGraph, yDifferentialVars, algebraicRules, yTable, pTable } =
    compilation;
  const emitter = new Emitter();

  const RATE_TMP = "rate_tmp";
  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    UGLY_HACK_TODO_CHANGE_YDOT_PARAM,
    RESIDUAL_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);

  localsTable.addLocal(RATE_TMP);

  // 1 local for RATE_TMP
  emitter.emitListHeader(1);
  emitter.emitUint(1);
  emitter.emitByte(ValType.f64);

  const scope = new GlobalScope(compilation, localsTable, functionTable);

  const assignments = assignmentGraph.getAssignmentOrder(
    yDifferentialVars
      .map((name) => ({ kind: "rate", name }) as Assignable)
      .concat(
        algebraicRules.map(
          ({ name }) => ({ kind: "algebraic", name }) as Assignable,
        ),
      ),
  );

  for (const assignment of assignments) {
    const { kind, name, expression } = assignment;
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
        // for the residual we turn dy/dt = f(t, y, p) into 0 = dy/dt - f(t, y, p)

        // first store it in the temp
        emitExpression(expression, emitter, scope, { compilation });

        emitter.emitByte(OpCode.localset);
        emitter.emitUint(localsTable.getLocal(RATE_TMP));

        // then find the resisdual
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(RESIDUAL_PARAM));

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(
          localsTable.getParam(UGLY_HACK_TODO_CHANGE_YDOT_PARAM),
        );

        emitter.emitByte(OpCode.f64load);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_DOUBLE * yTable.get(name));

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(RATE_TMP));

        emitter.emitByte(OpCode.f64sub);

        emitter.emitByte(OpCode.f64store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_DOUBLE * yTable.get(name));

        // and store it in p
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(P_PARAM));

        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getLocal(RATE_TMP));

        emitter.emitByte(OpCode.f64store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(SIZEOF_DOUBLE * pTable.get(name));
        break;
      case "algebraic":
        emitter.emitByte(OpCode.localget);
        emitter.emitUint(localsTable.getParam(RESIDUAL_PARAM));

        emitExpression(expression, emitter, scope, { compilation });

        emitter.emitByte(OpCode.f64store);
        emitter.emitUint(MEM_ALIGNMENT);
        emitter.emitUint(
          SIZEOF_DOUBLE *
            (compilation.yDifferentialVars.length + assignment.index),
        );
        break;
    }
  }

  emitter.emitI32ConstOp(0);

  emitter.emitByte(OpCode.end);

  return emitter;
};
