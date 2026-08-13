import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import {
  CompareContext,
  ConstantContext,
  FormulaContext,
  LogicalContext,
  NameContext,
  NotContext,
  StoichiometryContext,
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
} from "../grammar";
import type { IridiumExpression } from "iridium-simulator";
import type { Metadata } from "./metadata";
import { CompileInvariantError } from "../errors";

export const compileFormula = (
  formula: FormulaContext,
): IridiumExpression<Metadata> => {
  const formulaListener = new FormulaCompilerListener();
  ParseTreeWalker.DEFAULT.walk(formulaListener as ParseTreeListener, formula);
  return formulaListener.getResult();
};

export const compileStoichiometry = (
  stoichiometry: StoichiometryContext,
): IridiumExpression<Metadata> => {
  const number = stoichiometry.NUMBER();
  if (number !== undefined) {
    return {
      kind: "number",
      value: Number(stoichiometry.text), // we do the whole thing since there might be an additional '-' before the NUMBER token
      metadata: { tree: stoichiometry },
    };
  } else {
    return {
      kind: "variable",
      name: getVariableName(stoichiometry.variable()!),
      metadata: { tree: stoichiometry },
    };
  }
};

const getVariableName = (ctx: VariableContext): string => {
  if (ctx instanceof NameContext) {
    return ctx.NAME().text;
  } else if (ctx instanceof SubvariableContext) {
    throw new CompileInvariantError("Not yet supported.");
  } else if (ctx instanceof ConstantContext) {
    return getVariableName(ctx.variable());
  }
  throw new CompileInvariantError("Unknown variable.");
};

const unreachable = (message: string): never => {
  throw new Error(message);
};

class FormulaCompilerListener implements AntimonyListener {
  #stack: IridiumExpression<Metadata>[];

  constructor() {
    this.#stack = [];
  }

  getResult(): IridiumExpression<Metadata> {
    return this.#stack.pop()!;
  }

  exitFunctionCall(ctx: FunctionCallContext): void {
    const count = ctx.argumentList()?.formula()?.length ?? 0;
    const args: IridiumExpression<Metadata>[] = [];

    for (let i = 0; i < count; i++) {
      args.push(this.#stack.pop()!);
    }

    args.reverse();

    this.#stack.push({
      kind: "call",
      args: args,
      name: ctx.NAME().text,
      metadata: { tree: ctx },
    });
  }

  exitNumber(ctx: NumberContext): void {
    this.#stack.push({
      kind: "number",
      value: Number(ctx.NUMBER().text),
      metadata: { tree: ctx },
    });
  }

  exitVar(ctx: VarContext): void {
    this.#stack.push({
      kind: "variable",
      name: getVariableName(ctx.variable()),
      metadata: { tree: ctx },
    });
  }

  exitPositive(_ctx: PositiveContext): void {
    // skip this it doesn't do anything
  }

  exitNegative(ctx: NegativeContext): void {
    this.#stack.push({
      kind: "unary",
      op: "neg",
      expr: this.#stack.pop()!,
      metadata: { tree: ctx },
    });
  }

  exitPower(ctx: PowerContext) {
    this.#stack.push({
      kind: "binary",
      op: "pow",
      right: this.#stack.pop()!,
      left: this.#stack.pop()!,
      metadata: { tree: ctx },
    });
  }

  exitProduct(ctx: ProductContext): void {
    this.#stack.push({
      kind: "binary",
      op:
        ctx._op.text === "*"
          ? "mul"
          : ctx._op.text === "/"
            ? "div"
            : ctx._op.text === "%"
              ? "mod"
              : unreachable(`Unknown operator: ${ctx._op}`),
      right: this.#stack.pop()!,
      left: this.#stack.pop()!,
      metadata: { tree: ctx },
    });
  }

  exitSum(ctx: SumContext): void {
    this.#stack.push({
      kind: "binary",
      op:
        ctx._op.text === "+"
          ? "add"
          : ctx._op.text === "-"
            ? "sub"
            : unreachable(`Unknown operator: ${ctx._op}`),
      right: this.#stack.pop()!,
      left: this.#stack.pop()!,
      metadata: { tree: ctx },
    });
  }

  exitCompare(ctx: CompareContext): void {
    const right = this.#stack.pop()!;
    const left = this.#stack.pop()!;

    const op =
      ctx._op.text === ">="
        ? "ge"
        : ctx._op.text === "<="
          ? "le"
          : ctx._op.text === ">"
            ? "gt"
            : ctx._op.text === "<"
              ? "lt"
              : ctx._op.text === "=="
                ? "eq"
                : ctx._op.text === "!="
                  ? "neq"
                  : unreachable(`Unknown operator: ${ctx._op}`);

    // convert a < b < c == d into a < b && b < c && c == d
    const leftCtx = ctx.formula(0);
    if (leftCtx instanceof CompareContext) {
      this.#stack.push({
        kind: "binary",
        op: "and",
        left: left,
        right: {
          kind: "binary",
          op: op,
          left: compileFormula(leftCtx.formula(1)),
          right: right,
          metadata: { tree: leftCtx },
        },
        metadata: { tree: ctx },
      });
    } else {
      this.#stack.push({
        kind: "binary",
        op,
        left,
        right,
        metadata: { tree: ctx },
      });
    }
  }

  exitNot(ctx: NotContext): void {
    this.#stack.push({
      kind: "unary",
      op: "not",
      expr: this.#stack.pop()!,
      metadata: { tree: ctx },
    });
  }

  exitLogical(ctx: LogicalContext): void {
    this.#stack.push({
      kind: "binary",
      op:
        ctx._op.text === "&&"
          ? "and"
          : ctx._op.text === "||"
            ? "or"
            : unreachable(`Unknown operator: ${ctx._op}`),
      right: this.#stack.pop()!,
      left: this.#stack.pop()!,
      metadata: { tree: ctx },
    });
  }
}
