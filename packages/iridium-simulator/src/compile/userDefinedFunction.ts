import type { IridiumFunction } from "../ir/model";
import { OpCode, ValType } from "./codes";
import Emitter from "./Emitter";
import { emitExpression } from "./expression";
import type { WasmFunction } from "./functions";
import { FunctionScope } from "./Scope";
import { LocalsSymbolTable, type FunctionTable } from "./symbolTables";

export const compileAllUserDefinedFunctions = (
  functions: IridiumFunction[],
): WasmFunction[] => {
  const result: WasmFunction[] = [];

  for (const func of functions) {
    result.push({
      kind: "compile",
      isExported: false,
      name: func.name,
      params: func.parameters.map((_) => ValType.f64),
      results: [ValType.f64],
      compileBody: (functionTable) =>
        compileUserDefinedFunction(func, functionTable).getOutput(),
    });
  }

  return result;
};

export const compileUserDefinedFunction = (
  func: IridiumFunction,
  functionTable: FunctionTable,
): Emitter => {
  const emitter = new Emitter();

  emitter.emitListHeader(0);

  const localsTable = new LocalsSymbolTable(func.parameters);

  const scope = new FunctionScope(localsTable, functionTable);

  emitExpression(func.body, emitter, scope, {
    handlePiecewiseWithEvents: false,
  });

  emitter.emitByte(OpCode.end);

  return emitter;
};
