import type { IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import type { Builder, UnknownAttrs } from "../builder";
import { SbmlCompileInternalError } from "../errors";
import { Context, popContext, type ContextResult } from "./base";

const FUNCTION_TAGS = new Set(["times"]);

// TODO:
// cn, ci, csymbol, sep
// apply, piecewise, piece, otherwise, lambda
// eq, neq, gt, lt, geq, leq
// plus, minus, times, divide, power, root, abs, exp, ln, log, floor, ceiling, factorial, quotient, max, min, rem
// and, or, xor, not, implies
// degree, bvar, logbase
// sin, cos, tan, sec, csc, cot, sinh, cosh, tanh, sech, csch, coth, arcsin, arccos, arctan, arcsec, arcsc, arccot, arcsinh, arccosh, arctanh, arcsech, arccsch, arccoth
// true, false, notanumber, pi, infinity, exponentiale

export class MathContext extends Context {
  #stack: IridiumExpression[];
  #applyCounts: number[];
  #isNextSymbol: boolean;

  constructor(builder: Builder) {
    super(builder);
    this.#stack = [];
    this.#applyCounts = [];
    this.#isNextSymbol = false;
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    this.#isNextSymbol = false;

    if (this.#applyCounts.length > 0) {
      this.#applyCounts[this.#applyCounts.length - 1] += 1;
    }

    if (name === "apply") {
      this.#applyCounts.push(0);
    } else if (name === "ci") {
      this.#isNextSymbol = true;
    }

    return;
  }

  onText(text: string): ContextResult | undefined {
    if (this.#isNextSymbol) {
      this.#stack.push(expr.var(text.trim()));
    }
    return;
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name === "apply") {
      const children = [];
      const count = this.#applyCounts.pop();
      if (count === undefined)
        throw new SbmlCompileInternalError("Bad <apply>.");

      for (let i = 0; i < count; i++) {
        const got = this.#stack.pop();
        if (!got) throw new SbmlCompileInternalError("Bad <apply>.");
        children.push(got);
      }

      children.reverse();

      const func = children[0];
      const args = children.slice(1);

      if (func.kind !== "variable") {
        throw new SbmlCompileInternalError("Bad <apply>.");
      }

      this.#stack.push(expr.call(func.name, args));
    } else if (FUNCTION_TAGS.has(name)) {
      this.#stack.push(expr.var(name));
    } else if (name === "math") {
      return popContext(this.#stack.pop());
    }
  }
}
