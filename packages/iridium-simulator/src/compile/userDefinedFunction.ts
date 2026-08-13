import { CompileInvariantError } from "antimony-language/errors";
import { walkExpression } from "../ir/ast";
import type { IridiumFunction } from "../ir/model";
import { OpCode, ValType } from "./codes";
import Emitter from "./Emitter";
import { emitExpression } from "./expression";
import type { WasmFunction } from "./functions";
import { FunctionScope } from "./scope";
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

export const checkNoRecursiveCalls = (functions: IridiumFunction[]): void => {
  const unvisited = new Set(functions.map((f) => f.name));
  const graph = new Map<string, Set<string>>();

  for (const func of functions) {
    const vertices = new Set<string>();

    walkExpression(func.body, {
      afterCall({ name }) {
        // unvisited right now is just all the user-defined function names
        if (unvisited.has(name)) {
          vertices.add(name);
        }
      },
    });

    graph.set(func.name, vertices);
  }

  while (unvisited.size > 0) {
    const got = unvisited.keys().next().value!;
    unvisited.delete(got);

    const searching = Array.from(graph.get(got)!);

    const visited = new Set<string>([got]);
    while (searching.length > 0) {
      const neighbor = searching.pop()!;

      if (visited.has(neighbor)) {
        // TODO: better error message
        throw new CompileInvariantError("Recursive function call detected.");
      }

      if (!unvisited.has(neighbor)) continue;

      unvisited.delete(neighbor);

      visited.add(neighbor);

      for (const next of graph.get(neighbor)!) {
        searching.push(next);
      }
    }
  }
};
