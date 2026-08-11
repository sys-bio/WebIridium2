import {
  visitExpression,
  type IridiumExpression,
  type IridiumExpressionVisitor,
} from "../ir/ast";
import { OpCode, ValType } from "./codes";
import type { Compilation } from "./Compilation";
import type Emitter from "./Emitter";
import type { Scope } from "./Scope";
import {
  AND_RESERVED_NAME,
  OR_RESERVED_NAME,
  PIECEWISE_NAME,
  POW_RESERVED_NAME,
  inlineFunctions,
  predefinedFuncDefs,
  type InlineFunction,
} from "./functions";
import { CompileError } from "./errors";
import { EVENTS_PARAM } from "../names";
import { MEM_ALIGNMENT, SIZEOF_INT } from "./constants";

const FLAG_USE_EVENT_STATE_FOR_PIECEWISE = false;

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

/**
 * Emits bytecode for an expression.
 *
 * @param expression - the expression to compile
 * @param emitter - emitter for the bytecode
 * @param compilation - compilation unit
 * @param scope - scope expression is evaluated in
 * @param handlePiecewiseWithEvents - Whether or not to mark piecewise functions with events.
 *                                    Want this when doing anything in the RHS where we need to restart
 *                                    at discontinuities. Default: true.
 */
export const emitExpression = (
  expression: IridiumExpression,
  emitter: Emitter,
  compilation: Compilation,
  scope: Scope,
  handlePiecewiseWithEvents: boolean = true,
): void => {
  const visitor: IridiumExpressionVisitor<void> = {
    visitNumber: ({ value }) => {
      emitter.emitF64ConstOp(value);
    },
    visitVariable: (expr) => {
      scope.emitLoadVariable(emitter, expr);
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
          // TODO: `rem` is not available for floats in WASM. We will have to convert to int first.
          //       How does roadrunner evaluate it?
          throw new Error("TODO");
        case "pow":
          emitter.emitCallOp(scope.functionTable.get(POW_RESERVED_NAME));
          break;
        case "and":
          emitter.emitCallOp(scope.functionTable.get(AND_RESERVED_NAME));
          break;
        case "or":
          emitter.emitCallOp(scope.functionTable.get(OR_RESERVED_NAME));
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
      if (expr.name === PIECEWISE_NAME) {
        if (expr.args.length === 0) {
          throw new CompileError(
            "Piecewise require at least one argument.",
            expr.metadata,
          );
        }

        if (expr.args.length % 2 === 0) {
          throw new CompileError(
            "You must provide a fallback case.",
            expr.metadata,
          );
        }

        if (expr.args.length === 1) {
          visitExpression(expr.args[0], visitor);
          return;
        }

        if (handlePiecewiseWithEvents && FLAG_USE_EVENT_STATE_FOR_PIECEWISE) {
          let i = 0;
          for (; i + 2 < expr.args.length; i += 2) {
            const branch = expr.args[i];
            const condition = expr.args[i + 1];
            const eventIndex = compilation.getPiecewisePieceIndex(condition);

            emitter.emitByte(OpCode.localget);
            emitter.emitUint(scope.localsTable.getParam(EVENTS_PARAM));

            emitter.emitByte(OpCode.i32load);
            emitter.emitUint(MEM_ALIGNMENT);
            emitter.emitUint(eventIndex * SIZEOF_INT);

            emitter.emitByte(OpCode.if);
            emitter.emitByte(ValType.f64);

            visitExpression(branch, visitor);

            emitter.emitByte(OpCode.else);
          }

          visitExpression(expr.args[expr.args.length - 1], visitor);

          for (i = 0; i + 2 < expr.args.length; i += 2) {
            emitter.emitByte(OpCode.end);
          }
        } else {
          let i = 0;
          for (; i + 2 < expr.args.length; i += 2) {
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

          visitExpression(expr.args[expr.args.length - 1], visitor);

          for (i = 0; i + 2 < expr.args.length; i += 2) {
            emitter.emitByte(OpCode.end);
          }
        }
      } else if (expr.name === "and") {
        if (expr.args.length === 0) {
          emitter.emitF64ConstOp(1);
        } else {
          for (let i = 0; i < expr.args.length; i++) {
            if (i > 0) {
              emitter.emitByte(OpCode.if);
              emitter.emitByte(ValType.i32);
            }

            visitExpression(expr.args[i], visitor);

            emitter.emitF64ConstOp(0);
            emitter.emitByte(OpCode.f64ne);
          }

          for (let i = 0; i < expr.args.length - 1; i++) {
            emitter.emitByte(OpCode.else);
            emitter.emitI32ConstOp(0);
            emitter.emitByte(OpCode.end);
          }

          emitter.emitByte(OpCode.f64convert_u_i32);
        }
      } else if (expr.name === "or") {
        if (expr.args.length === 0) {
          emitter.emitF64ConstOp(0);
        } else {
          for (let i = 0; i < expr.args.length; i++) {
            if (i > 0) {
              emitter.emitByte(OpCode.if);
              emitter.emitByte(ValType.i32);
            }

            visitExpression(expr.args[i], visitor);

            emitter.emitF64ConstOp(0);
            emitter.emitByte(OpCode.f64eq);
          }

          for (let i = 0; i < expr.args.length - 1; i++) {
            emitter.emitByte(OpCode.else);
            emitter.emitI32ConstOp(0);
            emitter.emitByte(OpCode.end);
          }

          emitter.emitByte(OpCode.i32eqz);
          emitter.emitByte(OpCode.f64convert_u_i32);
        }
      } else if (expr.name === "xor") {
        if (expr.args.length === 0) {
          emitter.emitF64ConstOp(0);
        } else {
          for (let i = 0; i < expr.args.length; i++) {
            visitExpression(expr.args[i], visitor);

            emitter.emitF64ConstOp(0);
            emitter.emitByte(OpCode.f64ne);

            if (i > 0) {
              emitter.emitByte(OpCode.i32xor);
            }
          }

          emitter.emitByte(OpCode.f64convert_u_i32);
        }
      } else if (expr.name === "plus") {
        if (expr.args.length === 0) {
          emitter.emitF64ConstOp(0);
        } else {
          for (let i = 0; i < expr.args.length; i++) {
            visitExpression(expr.args[i], visitor);
            if (i > 0) {
              emitter.emitByte(OpCode.f64add);
            }
          }
        }
      } else if (expr.name === "times") {
        if (expr.args.length === 0) {
          emitter.emitF64ConstOp(1);
        } else {
          for (let i = 0; i < expr.args.length; i++) {
            visitExpression(expr.args[i], visitor);
            if (i > 0) {
              emitter.emitByte(OpCode.f64mul);
            }
          }
        }
      } else if (expr.name === "max") {
        for (let i = 0; i < expr.args.length; i++) {
          visitExpression(expr.args[i], visitor);
          if (i > 0) {
            emitter.emitByte(OpCode.f64max);
          }
        }
      } else if (expr.name === "min") {
        for (let i = 0; i < expr.args.length; i++) {
          visitExpression(expr.args[i], visitor);
          if (i > 0) {
            emitter.emitByte(OpCode.f64min);
          }
        }
      } else {
        for (const arg of expr.args) {
          visitExpression(arg, visitor);
        }

        if (inlineFunctions.has(expr.name)) {
          (predefinedFuncDefs[expr.name] as InlineFunction).emit(emitter);
        } else {
          emitter.emitCallOp(scope.functionTable.get(expr.name));
        }
      }
    },
  };

  visitExpression(expression, visitor);
};
