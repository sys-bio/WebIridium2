import {
  CompareContext,
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
import { getVariableName } from "antimony-language/semantic/util";

import type Emitter from "./Emitter";
import { OpCode } from "./codes";

const TODO = () => {
  throw new Error("TODO");
};

export class FormulaCompilerListener implements AntimonyListener {
  #emitter: Emitter;
  #emitLoadVariable: (name: string) => void;

  /**
   * Load variable should emit instructions to load f64 in memory for the
   * given variable name.
   */
  constructor(emitter: Emitter, emitLoadVariable: (name: string) => void) {
    this.#emitter = emitter;
    this.#emitLoadVariable = emitLoadVariable;
  }

  exitFunctionCall(_ctx: FunctionCallContext): void {
    TODO();
  }

  exitNumber(ctx: NumberContext): void {
    this.#emitter.emitByte(OpCode.f64const);
    this.#emitter.emitFloat64(Number(ctx.NUMBER().text));
  }

  exitVar(ctx: VarContext): void {
    this.#emitLoadVariable(getVariableName(ctx.variable()));
  }

  exitPositive(_ctx: PositiveContext): void {
    // TODO: is this actually how the + operator works
    this.#emitter.emitByte(OpCode.f64abs);
  }

  exitNegative(_ctx: NegativeContext): void {
    this.#emitter.emitByte(OpCode.f64neg);
  }

  exitPower(_ctx: PowerContext) {
    // no general power operation in wasm
    TODO();
  }

  exitProduct(ctx: ProductContext): void {
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
    if (ctx._op.text === "+") {
      this.#emitter.emitByte(OpCode.f64add);
    } else if (ctx._op.text === "-") {
      this.#emitter.emitByte(OpCode.f64min);
    } else {
      throw new Error(`unknown op: ${ctx._op.text}`);
    }
  }

  exitCompare(_ctx: CompareContext): void {
    // TODO:
    TODO();
  }
}
