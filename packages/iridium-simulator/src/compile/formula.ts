import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import {
  CompareContext,
  ConstantContext,
  FormulaContext,
  LogicalContext,
  NameContext,
  SubvariableContext,
  SumContext,
  VariableContext,
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
import { OpCode } from "./codes";
import type { IndexSymbolTable } from "./SymbolTable";
import { POW_RESERVED_NAME } from "./functions";
import type { EmitLoadVariableFunction } from "./Emitter";
import {
  builtinFunctions,
  inlineFunctions,
  type InlineFunction,
} from "./functions";
import { CompileError } from "./errors";

const TODO = () => {
  throw new Error("TODO");
};

export const getVariableName = (variableCtx: VariableContext): string => {
  if (variableCtx instanceof NameContext) {
    return variableCtx.NAME().text;
  } else if (variableCtx instanceof SubvariableContext) {
    throw new CompileError("Subvariables not yet supported here.", {
      tree: variableCtx,
    });
  } else if (variableCtx instanceof ConstantContext) {
    return getVariableName(variableCtx.variable());
  } else {
    throw new Error(`unknown variable type: ${variableCtx.text}`);
  }
};

export const emitFormula = (
  formula: FormulaContext,
  emitter: Emitter,
  emitLoadVariable: EmitLoadVariableFunction,
  functionTable: IndexSymbolTable,
): void => {
  const formulaListener = new FormulaCompilerListener(
    emitter,
    emitLoadVariable,
    functionTable,
  );

  ParseTreeWalker.DEFAULT.walk(formulaListener as ParseTreeListener, formula);
};

class FormulaCompilerListener implements AntimonyListener {
  protected emitter: Emitter;
  #emitLoadVariable: EmitLoadVariableFunction;
  #functionTable: IndexSymbolTable;

  constructor(
    emitter: Emitter,
    emitLoadVariable: EmitLoadVariableFunction,
    functionTable: IndexSymbolTable,
  ) {
    this.emitter = emitter;
    this.#emitLoadVariable = emitLoadVariable;
    this.#functionTable = functionTable;
  }

  exitFunctionCall(_ctx: FunctionCallContext): void {
    const name = _ctx.NAME().text;
    if (inlineFunctions.has(name)) {
      (builtinFunctions[name] as InlineFunction).emit(this.emitter);
    } else {
      const functionIndex = this.#functionTable.get(_ctx.NAME().text);
      this.emitter.emitByte(OpCode.call);
      this.emitter.emitUint32(functionIndex);
    }
  }

  exitNumber(ctx: NumberContext): void {
    this.emitter.emitByte(OpCode.f64const);
    this.emitter.emitFloat64(Number(ctx.NUMBER().text));
  }

  exitVar(ctx: VarContext): void {
    this.#emitLoadVariable(this.emitter, getVariableName(ctx.variable()));
  }

  exitPositive(_ctx: PositiveContext): void {
    // TODO: is this actually how the + operator works (does not seem so)
    this.emitter.emitByte(OpCode.f64abs);
  }

  exitNegative(_ctx: NegativeContext): void {
    this.emitter.emitByte(OpCode.f64neg);
  }

  exitPower(_ctx: PowerContext) {
    this.emitter.emitByte(OpCode.call);
    this.emitter.emitUint32(this.#functionTable.get(POW_RESERVED_NAME));
  }

  exitProduct(ctx: ProductContext): void {
    if (ctx._op.text === "*") {
      this.emitter.emitByte(OpCode.f64mul);
    } else if (ctx._op.text === "/") {
      this.emitter.emitByte(OpCode.f64div);
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
      this.emitter.emitByte(OpCode.f64add);
    } else if (ctx._op.text === "-") {
      this.emitter.emitByte(OpCode.f64sub);
    } else {
      throw new Error(`unknown op: ${ctx._op.text}`);
    }
  }

  exitCompare(ctx: CompareContext): void {
    if (ctx._op.text === ">=") {
      this.emitter.emitByte(OpCode.f64ge);
    } else if (ctx._op.text === "<=") {
      this.emitter.emitByte(OpCode.f64le);
    } else if (ctx._op.text === "<") {
      this.emitter.emitByte(OpCode.f64lt);
    } else if (ctx._op.text === ">") {
      this.emitter.emitByte(OpCode.f64gt);
    } else if (ctx._op.text === "==") {
      this.emitter.emitByte(OpCode.f64eq);
    } else if (ctx._op.text === "!=") {
      this.emitter.emitByte(OpCode.f64ne);
    } else {
      throw new Error(`unknown comparison op: ${ctx._op.text}`);
    }

    this.emitter.emitByte(OpCode.f64convert_u_i32);
  }

  exitLogical(_ctx: LogicalContext): void {
    TODO();
  }
}
