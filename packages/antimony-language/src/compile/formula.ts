import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import {
  CompareContext,
  FormulaContext,
  LogicalContext,
  NotContext,
  StoichiometryContext,
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
import type {
  AntimonyConversionFactor,
  AntimonyReference,
} from "../semantic/document";
import { getReferenceFromVariable } from "../semantic/BuildAntimonyListener";
import { CompileError } from "../errors";

export type ResolveReferenceFn = (
  reference: AntimonyReference,
  ctx?: VariableContext,
) => [
  name: string,
  conversionFactorExpr: IridiumExpression<Metadata> | undefined,
];

export const wrapConversionFactorExpr = (
  expr: IridiumExpression<Metadata>,
  factorExpr: IridiumExpression<Metadata> | undefined,
  isRead = false,
): IridiumExpression<Metadata> => {
  if (factorExpr) {
    return {
      kind: "binary",
      op: isRead ? "div" : "mul",
      left: expr,
      right: factorExpr,
      metadata: expr.metadata,
    };
  } else {
    return expr;
  }
};

export const compileConversionFactors = (
  factors: AntimonyConversionFactor[],
  resolveReference: ResolveReferenceFn,
): IridiumExpression<Metadata> => {
  let current: IridiumExpression<Metadata> | undefined;
  for (let i = 0; i < factors.length; i++) {
    const factor = factors[i];
    if (typeof factor === "number") {
      if (!current) {
        current = {
          kind: "number",
          value: factor,
        };
      } else {
        current = {
          kind: "binary",
          op: "mul",
          left: current,
          right: {
            kind: "number",
            value: factor,
          },
        };
      }
    } else {
      const [name, factorFactors] = resolveReference(factor);

      if (!current) {
        current = { kind: "variable", name };
      } else {
        current = {
          kind: "binary",
          op: "mul",
          left: current,
          right: {
            kind: "variable",
            name,
          },
        };
      }

      if (factorFactors) {
        current = wrapConversionFactorExpr(current, factorFactors);
      }
    }
  }
  return current!;
};

export const compileFormula = (
  formula: FormulaContext,
  resolveReference: ResolveReferenceFn,
): IridiumExpression<Metadata> => {
  const formulaListener = new FormulaCompilerListener(resolveReference);
  ParseTreeWalker.DEFAULT.walk(formulaListener as ParseTreeListener, formula);

  return formulaListener.getResult();
};

export const compileStoichiometry = (
  stoichiometry: StoichiometryContext,
  resolveReference: ResolveReferenceFn,
): IridiumExpression<Metadata> => {
  const number = stoichiometry.NUMBER();
  if (number !== undefined) {
    return {
      kind: "number",
      value: Number(stoichiometry.text), // we do the whole thing since there might be an additional '-' before the NUMBER token
      metadata: { tree: stoichiometry },
    };
  } else {
    const [name, variableConversionFactor] = resolveReference(
      getReferenceFromVariable(stoichiometry.variable()!),
    );

    return wrapConversionFactorExpr(
      {
        kind: "variable",
        name,
        metadata: { tree: stoichiometry },
      },
      variableConversionFactor,
    );
  }
};

const unreachable = (message: string): never => {
  throw new Error(message);
};

class FormulaCompilerListener implements AntimonyListener {
  #stack: IridiumExpression<Metadata>[];
  #resolveVariable: ResolveReferenceFn;

  constructor(resolveReference: ResolveReferenceFn) {
    this.#stack = [];
    this.#resolveVariable = resolveReference;
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
    const reference = getReferenceFromVariable(ctx.variable());

    if (reference.length > 1) {
      throw new CompileError(
        "cannot use subvariables or constants inside a function.",
        { tree: ctx },
      );
    }

    const [name, conversionFactorExpr] = this.#resolveVariable(reference);

    this.#stack.push(
      wrapConversionFactorExpr(
        {
          kind: "variable",
          name: name,
          metadata: { tree: ctx },
        },
        conversionFactorExpr,
        true,
      ),
    );
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
              : unreachable(`Unknown operator: ${ctx._op.text}`),
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
            : unreachable(`Unknown operator: ${ctx._op.text}`),
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
                  : unreachable(`Unknown operator: ${ctx._op.text}`);

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
          left: compileFormula(leftCtx.formula(1), this.#resolveVariable),
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
            : unreachable(`Unknown operator: ${ctx._op.text}`),
      right: this.#stack.pop()!,
      left: this.#stack.pop()!,
      metadata: { tree: ctx },
    });
  }
}
