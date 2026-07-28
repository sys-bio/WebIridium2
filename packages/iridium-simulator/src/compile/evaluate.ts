// TOOD: write tests for this

import {
  CORE_NAMESPACE,
  EVENTS_PARAM,
  IMPORT_NAMESPACE,
  MEMORY_IMPORT_NAME,
  P_PARAM,
  T_PARAM,
  Y_PARAM,
} from "../names.ts";
import { CompileModelError } from "./errors.ts";
import { Compilation } from "./Compilation.ts";
import {
  walkExpression,
  type IridiumExpression,
  type IridiumExpressionListener,
} from "../ir/ast.ts";
import { compileFunctions, getReferencedFunctions } from "./compile.ts";
import { Scope } from "./Scope.ts";
import {
  predefinedFuncDefs,
  type ImportedFunction,
  type WasmFunction,
} from "./functions.ts";
import { OpCode, ValType } from "./codes.ts";
import { LocalsSymbolTable, type FunctionTable } from "./symbolTables.ts";
import { emitExpression } from "./expression.ts";
import Emitter from "./Emitter.ts";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants.ts";
import { WASM_PAGE_SIZE } from "./wasm.ts";

/**
 * Evaluates the initial values of a model in a topological order, setting default
 * values for any variables without any assignment.
 *
 * @throws CompileError - when there is a cycle in the assignments
 * @param model - the model to evaluate the initial values of
 * @returns map of variable names to their initial values
 */
export const evaluateInitialValues = async (
  compilation: Compilation,
): Promise<Map<string, number>> => {
  const assignments = new Map<string, IridiumExpression>();
  for (const variable of compilation.variables.values()) {
    if (
      variable.value.kind === "initial" ||
      variable.value.kind === "reaction" ||
      variable.value.kind === "rate"
    ) {
      assignments.set(variable.name, variable.value.initial);
    } else if (variable.value.kind === "assignment") {
      assignments.set(variable.name, variable.value.assignment);
    }
  }
  const evalOrder = getAssignmentOrder(assignments);

  return await evaluateFromOrdering(compilation, assignments, evalOrder);
};

const EVALUATE_NAME = "evaluateInitialValues";
const EVALUATE_PARAMS = [ValType.f64, ValType.i32, ValType.i32, ValType.i32];
const EVALUATE_RESULTS = [] as ValType[];

const evaluateFromOrdering = async (
  compilation: Compilation,
  variables: Map<string, IridiumExpression>,
  order: string[],
): Promise<Map<string, number>> => {
  const referencedFunctions = Array.from(
    getReferencedFunctions(compilation, { shouldTrackPiecewise: false }),
  );

  const functions: WasmFunction[] = [
    {
      kind: "compile",
      isExported: true,
      name: EVALUATE_NAME,
      params: EVALUATE_PARAMS,
      results: EVALUATE_RESULTS,
      compileBody: (functionTable) =>
        compileEvaluateFromOrdering(
          compilation,
          functionTable,
          variables,
          order,
        ),
    },
    ...referencedFunctions.map((name) => {
      if (Object.hasOwn(predefinedFuncDefs, name)) {
        return predefinedFuncDefs[name];
      } else {
        throw new CompileModelError(`Unbound function: ${name}`);
      }
    }),
  ];

  const bytecode = compileFunctions(functions);
  const memory = new WebAssembly.Memory({
    initial: Math.ceil(
      WASM_PAGE_SIZE /
        Math.max(
          1,
          SIZEOF_DOUBLE * (compilation.yVars.length + compilation.pVars.length),
        ),
    ),
  });
  const { instance } = await WebAssembly.instantiate(bytecode, {
    [CORE_NAMESPACE]: { [MEMORY_IMPORT_NAME]: memory },
    [IMPORT_NAMESPACE]: Object.fromEntries(
      referencedFunctions.map((name) => [
        name,
        (predefinedFuncDefs[name] as ImportedFunction).js,
      ]),
    ),
  });

  const doubleView = new Float64Array(memory.buffer);
  for (
    let i = 0;
    i < compilation.yVars.length + compilation.pVars.length;
    i++
  ) {
    doubleView[i] = 0;
  }

  type EvaluateExport = (
    time: number,
    y: number,
    p: number,
    events: number,
  ) => void;

  (instance.exports[EVALUATE_NAME] as EvaluateExport)(
    0,
    0,
    SIZEOF_DOUBLE * compilation.yVars.length,
    SIZEOF_DOUBLE * (compilation.yVars.length + compilation.pVars.length),
  );

  const values = new Map<string, number>();
  for (let i = 0; i < compilation.yVars.length; i++) {
    values.set(compilation.yVars[i], doubleView[i]);
  }
  for (let i = 0; i < compilation.pVars.length; i++) {
    values.set(compilation.pVars[i], doubleView[compilation.yVars.length + i]);
  }

  return values;
};

const compileEvaluateFromOrdering = (
  compilation: Compilation,
  functionTable: FunctionTable,
  variables: Map<string, IridiumExpression>,
  order: string[],
): Uint8Array => {
  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);
  const scope = new Scope(compilation, localsTable, functionTable);

  const emitter = new Emitter();

  // no locals
  emitter.emitListHeader(0);

  for (const name of order) {
    const initial = variables.get(name)!;

    if (compilation.yTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_PARAM));
    } else {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_PARAM));
    }

    emitExpression(initial, emitter, compilation, scope, false);

    if (compilation.yTable.has(name)) {
      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * compilation.yTable.get(name));
    } else {
      emitter.emitByte(OpCode.f64store);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * compilation.pTable.get(name));
    }
  }

  emitter.emitByte(OpCode.end);

  return emitter.getOutput();
};

const getReferencedVariables = (expression: IridiumExpression): Set<string> => {
  const referenced = new Set<string>();
  const listener: IridiumExpressionListener = {
    afterVariable: ({ name }) => referenced.add(name),
  };
  walkExpression(expression, listener);
  return referenced;
};

/**
 * Returns toplogically sorted evaluation for assignments. Assignments are represented
 * by a map of names to (optional) expressions.Expressions may also contain variables
 * not listed in the assignments. In that case, these variables are assumed to already
 * have a value and not listed in the output.
 *
 * @throws CompileError - if there is a cycle in the assignments
 * @param assignments - map of variable names to (optional) assignment expressions
 * @returns toplogically sorted assignment ordering
 */
export const getAssignmentOrder = (
  assignments: Map<string, IridiumExpression>,
  { allowSelfCycle = false } = {},
): string[] => {
  const graph: Record<string, Set<string>> = {};
  const inDegrees: Record<string, number> = {};

  for (const variable of assignments.keys()) {
    graph[variable] = new Set();
    inDegrees[variable] = 0;
  }

  for (const [name, assignment] of assignments) {
    for (const neighbor of getReferencedVariables(assignment)) {
      if (allowSelfCycle && neighbor === name) continue;

      if (Object.hasOwn(graph, neighbor)) {
        inDegrees[name] += 1;
        graph[neighbor].add(name);
      } // otherwise we assume it already has an assignment
    }
  }

  const queue: string[] = [];
  for (const [variable, inDegree] of Object.entries(inDegrees)) {
    if (inDegree === 0) {
      queue.push(variable);
    }
  }

  const order: string[] = [];

  let variable: string | undefined;
  while ((variable = queue.shift())) {
    order.push(variable);
    for (const neighbor of graph[variable]) {
      inDegrees[neighbor] -= 1;

      if (inDegrees[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length !== assignments.size) {
    // TODO: add more specific error for where the cycle occurred?
    throw new CompileModelError("Cycle detected in assignments.");
  }

  return order;
};
