import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import {
  CompareContext,
  FormulaContext,
  LogicalContext,
  NotContext,
  SumContext,
  type AntimonyListener,
  type FunctionCallContext,
  type NegativeContext,
  type NumberContext,
  type PositiveContext,
  type PowerContext,
  type ProductContext,
  type VarContext,
} from "antimony-language/grammar";
import type Emitter from "./Emitter";
import { OpCode, ValType } from "./codes";
import {
  AND_RESERVED_NAME,
  OR_RESERVED_NAME,
  PIECEWISE_NAME,
  POW_RESERVED_NAME,
} from "./functions";
import {
  predefinedFuncDefs,
  inlineFunctions,
  type InlineFunction,
} from "./functions";
import { CompileError } from "./errors";
import type { Compilation } from "./Compilation.ts";
import type { Scope } from "./Scope.ts";
import { EVENTS_PARAM } from "../names.ts";
import { MEM_ALIGNMENT, SIZEOF_INT } from "./constants.ts";

const TODO = () => {
  throw new Error("TODO");
};

export const emitFormula = (
  formula: FormulaContext,
  emitter: Emitter,
  compilation: Compilation,
  scope: Scope,
): void => {
  const formulaListener = new FormulaCompilerListener(
    emitter,
    compilation,
    scope,
  );

  ParseTreeWalker.DEFAULT.walk(formulaListener as ParseTreeListener, formula);
};

export const emitComparisonOperator = (emitter: Emitter, op: string): void => {
  if (op === ">=") {
    emitter.emitByte(OpCode.f64ge);
  } else if (op === "<=") {
    emitter.emitByte(OpCode.f64le);
  } else if (op === "<") {
    emitter.emitByte(OpCode.f64lt);
  } else if (op === ">") {
    emitter.emitByte(OpCode.f64gt);
  } else if (op === "==") {
    emitter.emitByte(OpCode.f64eq);
  } else if (op === "!=") {
    emitter.emitByte(OpCode.f64ne);
  } else {
    throw new Error(`unknown comparison op: ${op}`);
  }
};

class FormulaCompilerListener implements AntimonyListener {
  #emitter: Emitter;
  #compilation: Compilation;
  #scope: Scope;

  // Some functions are special because they are variadic.
  // We can't really express this with normal WASM function calls so we just hard-code it.
  // When we do this we have to block their arguments from being executed which we do with this
  // flag.
  #isInsideMacro: boolean;

  constructor(emitter: Emitter, compilation: Compilation, scope: Scope) {
    this.#emitter = emitter;
    this.#compilation = compilation;
    this.#scope = scope;
    this.#isInsideMacro = false;
  }

  // hard-coding variadics
  enterFunctionCall(ctx: FunctionCallContext): void {
    if (this.#isInsideMacro) return;

    const name = ctx.NAME().text;
    if (name === "and") {
      this.#isInsideMacro = true;

      const args = ctx.argumentList();
      if (!args) {
        this.#emitter.emitF64ConstOp(1);
      } else {
        const formulas = args.formula();

        for (let i = 0; i < formulas.length; i++) {
          if (i > 0) {
            this.#emitter.emitByte(OpCode.if);
            this.#emitter.emitByte(ValType.i32);
          }

          emitFormula(
            formulas[i],
            this.#emitter,
            this.#compilation,
            this.#scope,
          );

          this.#emitter.emitF64ConstOp(0);
          this.#emitter.emitByte(OpCode.f64ne);
        }

        for (let i = 0; i < formulas.length - 1; i++) {
          this.#emitter.emitByte(OpCode.else);
          this.#emitter.emitI32ConstOp(0);
          this.#emitter.emitByte(OpCode.end);
        }

        this.#emitter.emitByte(OpCode.f64convert_u_i32);
      }
    } else if (name === "or") {
      this.#isInsideMacro = true;

      const args = ctx.argumentList();
      if (!args) {
        this.#emitter.emitF64ConstOp(0);
      } else {
        const formulas = args.formula();

        for (let i = 0; i < formulas.length; i++) {
          if (i > 0) {
            this.#emitter.emitByte(OpCode.if);
            this.#emitter.emitByte(ValType.i32);
          }

          emitFormula(
            formulas[i],
            this.#emitter,
            this.#compilation,
            this.#scope,
          );

          this.#emitter.emitF64ConstOp(0);
          this.#emitter.emitByte(OpCode.f64eq);
        }

        for (let i = 0; i < formulas.length - 1; i++) {
          this.#emitter.emitByte(OpCode.else);
          this.#emitter.emitI32ConstOp(0);
          this.#emitter.emitByte(OpCode.end);
        }

        this.#emitter.emitByte(OpCode.i32eqz);
        this.#emitter.emitByte(OpCode.f64convert_u_i32);
      }
    } else if (name === "xor") {
      this.#isInsideMacro = true;

      const args = ctx.argumentList();
      if (!args) {
        this.#emitter.emitF64ConstOp(0);
      } else {
        const formulas = args.formula();

        for (let i = 0; i < formulas.length; i++) {
          emitFormula(
            formulas[i],
            this.#emitter,
            this.#compilation,
            this.#scope,
          );

          this.#emitter.emitF64ConstOp(0);
          this.#emitter.emitByte(OpCode.f64ne);

          if (i > 0) {
            this.#emitter.emitByte(OpCode.i32xor);
          }
        }

        this.#emitter.emitByte(OpCode.f64convert_u_i32);
      }
    } else if (name === PIECEWISE_NAME) {
      this.#isInsideMacro = true;

      const args = ctx.argumentList();
      if (!args) {
        throw new CompileError("Piecewise require at least one argument.", {
          tree: ctx,
        });
      } else {
        const formulas = args.formula();
        if (formulas.length % 2 === 0) {
          throw new CompileError("You must provied a fallback case.", {
            tree: ctx,
          });
        }

        if (formulas.length === 1) {
          emitFormula(
            formulas[0],
            this.#emitter,
            this.#compilation,
            this.#scope,
          );
        } else {
          let i = 0;

          for (; i + 2 < formulas.length; i += 2) {
            const branch = formulas[i];
            const condition = formulas[i + 1];

            const eventIndex = this.#compilation.getPiecewisePiece(condition);

            // when we compile piecewise, the piecewise pieces will always be
            // the first in the event array.

            this.#emitter.emitByte(OpCode.localget);
            this.#emitter.emitUint(
              this.#scope.localsTable.getParam(EVENTS_PARAM),
            );

            this.#emitter.emitByte(OpCode.i32load);
            this.#emitter.emitUint(MEM_ALIGNMENT);
            this.#emitter.emitUint(eventIndex * SIZEOF_INT);

            this.#emitter.emitByte(OpCode.if);
            this.#emitter.emitByte(ValType.f64);

            emitFormula(branch, this.#emitter, this.#compilation, this.#scope);

            this.#emitter.emitByte(OpCode.else);
          }

          emitFormula(
            formulas[formulas.length - 1],
            this.#emitter,
            this.#compilation,
            this.#scope,
          );

          for (i = 0; i + 2 < formulas.length; i += 2) {
            this.#emitter.emitByte(OpCode.end);
          }
        }
      }
    }
  }

  exitFunctionCall(ctx: FunctionCallContext): void {
    const name = ctx.NAME().text;
    if (inlineFunctions.has(name)) {
      (predefinedFuncDefs[name] as InlineFunction).emit(this.#emitter);
    } else if (
      name === "and" ||
      name === "or" ||
      name === "xor" ||
      name === PIECEWISE_NAME
    ) {
      this.#isInsideMacro = false;
    } else {
      const functionIndex = this.#scope.functionTable.get(ctx.NAME().text);
      this.#emitter.emitCallOp(functionIndex);
    }
  }

  exitNumber(ctx: NumberContext): void {
    if (this.#isInsideMacro) return;

    this.#emitter.emitByte(OpCode.f64const);
    this.#emitter.emitFloat64(Number(ctx.NUMBER().text));
  }

  exitVar(ctx: VarContext): void {
    if (this.#isInsideMacro) return;

    this.#scope.emitLoadVariable(this.#emitter, ctx.variable());
  }

  exitPositive(_ctx: PositiveContext): void {
    if (this.#isInsideMacro) return;

    // TODO: is this actually how the + operator works (does not seem so)
    this.#emitter.emitByte(OpCode.f64abs);
  }

  exitNegative(_ctx: NegativeContext): void {
    if (this.#isInsideMacro) return;

    this.#emitter.emitByte(OpCode.f64neg);
  }

  exitPower(_ctx: PowerContext) {
    if (this.#isInsideMacro) return;

    this.#emitter.emitCallOp(this.#scope.functionTable.get(POW_RESERVED_NAME));
  }

  exitProduct(ctx: ProductContext): void {
    if (this.#isInsideMacro) return;

    if (ctx._op.text === "*") {
      this.#emitter.emitByte(OpCode.f64mul);
    } else if (ctx._op.text === "/") {
      this.#emitter.emitByte(OpCode.f64div);
    } else if (ctx._op.text === "%") {
      // TODO: `rem` is not available for floats in WASM. We will have to convert to int first.
      //       How does roadrunner evaluate it?
      TODO();
    } else {
      throw new Error(`unknown op: ${ctx._op.text}`);
    }
  }

  exitSum(ctx: SumContext): void {
    if (this.#isInsideMacro) return;

    if (ctx._op.text === "+") {
      this.#emitter.emitByte(OpCode.f64add);
    } else if (ctx._op.text === "-") {
      this.#emitter.emitByte(OpCode.f64sub);
    } else {
      throw new Error(`unknown op: ${ctx._op.text}`);
    }
  }

  exitCompare(ctx: CompareContext): void {
    if (this.#isInsideMacro) return;

    emitComparisonOperator(this.#emitter, ctx._op.text as string);
    this.#emitter.emitByte(OpCode.f64convert_u_i32);
  }

  exitNot(_ctx: NotContext): void {
    if (this.#isInsideMacro) return;

    this.#emitter.emitF64ConstOp(0);
    this.#emitter.emitByte(OpCode.f64eq);
    this.#emitter.emitByte(OpCode.f64convert_u_i32);
  }

  exitLogical(ctx: LogicalContext): void {
    if (this.#isInsideMacro) return;

    const op = ctx._op.text;
    if (op === "&&") {
      this.#emitter.emitCallOp(
        this.#scope.functionTable.get(AND_RESERVED_NAME),
      );
    } else if (op === "||") {
      this.#emitter.emitCallOp(this.#scope.functionTable.get(OR_RESERVED_NAME));
    } else {
      throw new CompileError(`Unknown logical operator: ${op}`, { tree: ctx });
    }
  }
}
