import {
  visitExpression,
  type IridiumExpression,
  type IridiumExpressionBuiltinCall,
  type IridiumExpressionCall,
  type IridiumExpressionVisitor,
} from "../ir/ast";
import { OpCode, ValType } from "./codes";
import type Emitter from "./Emitter";
import type { GlobalScope, Scope } from "./scope";
import {
  AND_RESERVED_NAME,
  MOD_RESERVED_NAME,
  OR_RESERVED_NAME,
  PIECEWISE_NAME,
  POW_RESERVED_NAME,
  predefinedFuncDefs,
  type Arity,
  type FunctionInfo,
  type InlineFunction,
  type WasmFunction,
} from "./functions";
import { CompileError, CompileInvariantError } from "./errors";
import { EVENTS_PARAM } from "../names";
import { MEM_ALIGNMENT, SIZEOF_INT } from "./constants";
import type { Compilation } from "./Compilation";
import { builtinFunctions } from "../runtime/builtins";

export const emitComparisonOperator = (emitter: Emitter, op: string): void => {
  if (op === "ge") {
    emitter.emitByte(OpCode.f64ge);
  } else if (op === "le") {
    emitter.emitByte(OpCode.f64le);
  } else if (op === "lt") {
    emitter.emitByte(OpCode.f64lt);
  } else if (op === "gt") {
    emitter.emitByte(OpCode.f64gt);
  } else if (op === "eq") {
    emitter.emitByte(OpCode.f64eq);
  } else if (op === "neq") {
    emitter.emitByte(OpCode.f64ne);
  } else {
    throw new Error(`unknown comparison op: ${op}`);
  }
};

const checkArity = (
  expr: IridiumExpressionCall | IridiumExpressionBuiltinCall,
  scope: Scope,
): void => {
  let arity: Arity | undefined;
  if (expr.kind === "builtinCall") {
    arity = (builtinFunctions as Record<string, FunctionInfo | undefined>)[
      expr.name
    ]?.arity;
  } else {
    arity = scope.getUserFunctionInfo(expr.name)?.arity;
  }

  if (!arity) {
    throw new CompileError(`Unknown function: ${expr.name}.`, expr);
  } else if (typeof arity === "number") {
    if (expr.args.length !== arity) {
      throw new CompileError(
        `${expr.name} expects ${arity} arguments, got ${expr.args.length}.`,
        expr,
      );
    }
  } else {
    if (expr.args.length < arity.min) {
      throw new CompileError(
        `${expr.name} expects at least ${arity.min} arguments, got ${expr.args.length}.`,
        expr,
      );
    } else if (arity.max !== undefined && expr.args.length > arity.max) {
      throw new CompileError(
        `${expr.name} expects at most ${arity.min} arguments, got ${expr.args.length}.`,
        expr,
      );
    }
  }
};

/**
 * Emits bytecode for an expression.
 *
 * @param expression - the expression to compile
 * @param emitter - emitter for the bytecode
 * @param compilation - compilation unit
 * @param scope - scope expression is evaluated in
 * @param handlePiecewiseWithEvents - Whether or not to mark piecewise functions with events.
 *                                    Want this when doing anything in the RHS where we need to restart
 *                                    at discontinuities. Default: false.
 */
export const emitExpression = (
  expression: IridiumExpression,
  emitter: Emitter,
  scope: Scope,
  {
    handlePiecewiseWithEvents = false,
    compilation,
  }: {
    handlePiecewiseWithEvents?: boolean;
    compilation?: Compilation;
  } = {},
): void => {
  const visitor: IridiumExpressionVisitor<void> = {
    visitNumber: ({ value }) => {
      emitter.emitF64ConstOp(value);
    },
    visitVariable: (expr) => {
      scope.emitLoadVariable(emitter, expr);
    },
    visitRateOf: (expr) => {
      scope.emitLoadRate(emitter, expr);
    },
    visitUnary: ({ op, expr }) => {
      visitExpression(expr, visitor);

      if (op === "neg") {
        emitter.emitByte(OpCode.f64neg);
      } else if (op === "not") {
        emitter.emitF64ConstOp(0);
        emitter.emitByte(OpCode.f64eq);
        emitter.emitByte(OpCode.f64convert_u_i32);
      } else {
        throw new Error(`unknown unary op: ${op as string}`);
      }
    },
    visitBinary: ({ op, left, right }) => {
      visitExpression(left, visitor);
      visitExpression(right, visitor);

      switch (op) {
        case "add":
          emitter.emitByte(OpCode.f64add);
          break;
        case "sub":
          emitter.emitByte(OpCode.f64sub);
          break;
        case "mul":
          emitter.emitByte(OpCode.f64mul);
          break;
        case "div":
          emitter.emitByte(OpCode.f64div);
          break;
        case "mod":
          scope.emitBuiltinCallOp(emitter, MOD_RESERVED_NAME);
          break;
        case "pow":
          scope.emitBuiltinCallOp(emitter, POW_RESERVED_NAME);
          break;
        case "and":
          scope.emitBuiltinCallOp(emitter, AND_RESERVED_NAME);
          break;
        case "or":
          scope.emitBuiltinCallOp(emitter, OR_RESERVED_NAME);
          break;
        case "eq":
        case "neq":
        case "le":
        case "lt":
        case "ge":
        case "gt":
          emitComparisonOperator(emitter, op);
          emitter.emitByte(OpCode.f64convert_u_i32);
          break;
      }
    },
    visitCall: (expr) => {
      checkArity(expr, scope);
      for (const arg of expr.args) {
        visitExpression(arg, visitor);
      }

      scope.emitUserCallOp(emitter, expr.name);
    },
    visitBuiltinVariable: (expr) => {
      scope.emitLoadBuiltin(emitter, expr);
    },
    visitBuiltinCall: (expr) => {
      checkArity(expr, scope);

      // very special case
      if (expr.name === PIECEWISE_NAME) {
        const hasFallback = expr.args.length % 2 === 1;

        if (expr.args.length === 1) {
          visitExpression(expr.args[0], visitor);
          return;
        }

        if (handlePiecewiseWithEvents) {
          if (!("localsTable" in scope)) {
            throw new CompileInvariantError(
              "Cannot use event-handled piecewise outside global scope.",
            );
          }
          if (!compilation) {
            throw new CompileInvariantError(
              "Cannot use event-handled piecewise without passing in compilation.",
            );
          }

          let i = 0;
          for (; i + 2 < expr.args.length; i += 2) {
            const branch = expr.args[i];
            const condition = expr.args[i + 1];
            const eventIndex = compilation.getPiecewisePieceIndex(condition);

            emitter.emitByte(OpCode.localget);
            emitter.emitUint(
              (scope as GlobalScope).localsTable.getParam(EVENTS_PARAM),
            );

            emitter.emitByte(OpCode.i32load);
            emitter.emitUint(MEM_ALIGNMENT);
            emitter.emitUint(eventIndex * SIZEOF_INT);

            emitter.emitByte(OpCode.if);
            emitter.emitByte(ValType.f64);

            visitExpression(branch, visitor);

            emitter.emitByte(OpCode.else);
          }

          if (hasFallback) {
            visitExpression(expr.args[expr.args.length - 1], visitor);
          } else {
            emitter.emitF64ConstOp(0);
          }

          for (i = 0; i + 1 < expr.args.length; i += 2) {
            emitter.emitByte(OpCode.end);
          }
        } else {
          let i = 0;
          for (; i + 1 < expr.args.length; i += 2) {
            const branch = expr.args[i];
            const condition = expr.args[i + 1];

            visitExpression(condition, visitor);

            emitter.emitF64ConstOp(0);
            emitter.emitByte(OpCode.f64ne);

            emitter.emitByte(OpCode.if);
            emitter.emitByte(ValType.f64);

            visitExpression(branch, visitor);

            emitter.emitByte(OpCode.else);
          }

          if (hasFallback) {
            visitExpression(expr.args[expr.args.length - 1], visitor);
          } else {
            emitter.emitF64ConstOp(0);
          }

          for (i = 0; i + 1 < expr.args.length; i += 2) {
            emitter.emitByte(OpCode.end);
          }
        }
      } else {
        const definition = predefinedFuncDefs[expr.name];
        if (!definition) {
          throw new CompileError("Unknown built-in function.", expr);
        }

        if (definition.kind === "macro") {
          definition.visit(expr, emitter, visitor, scope);
        } else {
          for (const arg of expr.args) {
            visitExpression(arg, visitor);
          }

          if (definition.kind === "inline") {
            (predefinedFuncDefs[expr.name] as InlineFunction).emit(emitter);
          } else {
            scope.emitBuiltinCallOp(emitter, expr.name);
          }
        }
      }
    },
  };

  visitExpression(expression, visitor);
};
