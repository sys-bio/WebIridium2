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
import {
  Compilation,
  createAssignmentsGraphFromCompilation,
} from "./Compilation.ts";
import {
  visitExpression,
  type IridiumExpression,
  type IridiumExpressionVisitor,
} from "../ir/ast.ts";
import { compileFunctions, getReferencedFunctions } from "./compile.ts";
import { GlobalScope } from "./scope.ts";
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
import { compileAllUserDefinedFunctions } from "./userDefinedFunction.ts";
import type { Assignment, Name } from "./graph.ts";

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
  const assignmentGraph = createAssignmentsGraphFromCompilation(
    compilation,
    true,
  );

  const relevantNames: Name[] = [];
  for (const variable of compilation.variables.values()) {
    if (
      variable.value.kind === "initial" ||
      variable.value.kind === "reaction" ||
      variable.value.kind === "rate" ||
      variable.value.kind === "assignment"
    ) {
      relevantNames.push({ kind: "name", name: variable.name });
    }
  }

  const assignments = assignmentGraph.getAssignmentOrder(relevantNames);

  return await evaluateFromAssignments(compilation, assignments);
};

const EVALUATE_NAME = "evaluateInitialValues";
const EVALUATE_PARAMS = [ValType.f64, ValType.i32, ValType.i32, ValType.i32];
const EVALUATE_RESULTS = [] as ValType[];

const evaluateFromAssignments = async (
  compilation: Compilation,
  assignments: Assignment[],
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
        compileEvaluateFromAssignments(compilation, functionTable, assignments),
    },
    ...compileAllUserDefinedFunctions(
      Array.from(compilation.functions.values()),
    ),
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
          SIZEOF_DOUBLE * (compilation.yTable.size + compilation.pTable.size),
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
  for (let i = 0; i < compilation.yTable.size + compilation.pTable.size; i++) {
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
    SIZEOF_DOUBLE * compilation.yTable.size,
    SIZEOF_DOUBLE * (compilation.yTable.size + compilation.pTable.size),
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

const compileEvaluateFromAssignments = (
  compilation: Compilation,
  functionTable: FunctionTable,
  assignments: Assignment[],
): Uint8Array => {
  const localsTable = new LocalsSymbolTable([
    T_PARAM,
    Y_PARAM,
    P_PARAM,
    EVENTS_PARAM,
  ]);
  const scope = new GlobalScope(compilation, localsTable, functionTable);

  const emitter = new Emitter();

  // no locals
  emitter.emitListHeader(0);

  for (const { kind, name, expression } of assignments) {
    // if its rate, it needs to go in p because its a ydot
    const isYTable = kind !== "rate" && compilation.yTable.has(name);

    if (isYTable) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(Y_PARAM));
    } else {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(P_PARAM));
    }

    emitExpression(expression, emitter, scope, {
      handlePiecewiseWithEvents: false,
    });

    if (isYTable) {
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

/**
 * Will evaluate a stoichiometry expression, returning a number if it can be done
 * at compile-time, or null if not.
 */
export const tryEvaluateStoichiometry = (
  expr: IridiumExpression,
): number | null => {
  try {
    const visitor: IridiumExpressionVisitor<number> = {
      visitBinary({ op, left, right }) {
        switch (op) {
          case "add":
            return (
              visitExpression(left, visitor) + visitExpression(right, visitor)
            );
          case "sub":
            return (
              visitExpression(left, visitor) - visitExpression(right, visitor)
            );
          case "mul":
            return (
              visitExpression(left, visitor) * visitExpression(right, visitor)
            );
          case "div":
            return (
              visitExpression(left, visitor) / visitExpression(right, visitor)
            );
          case "mod":
            // TODO: is this the correct behavior for negatives?
            return (
              visitExpression(left, visitor) % visitExpression(right, visitor)
            );
          case "pow":
            return (
              visitExpression(left, visitor) ^ visitExpression(right, visitor)
            );
          default:
            throw new Error("Unsupported op:" + op);
        }
      },
      visitNumber({ value }) {
        return value;
      },
      visitUnary({ op, expr }) {
        switch (op) {
          case "neg":
            return -visitExpression(expr, visitor);
          default:
            throw new Error("Unsupported op:" + op);
        }
      },
    };

    return visitExpression(expr, visitor);
  } catch {
    return null;
  }
};
