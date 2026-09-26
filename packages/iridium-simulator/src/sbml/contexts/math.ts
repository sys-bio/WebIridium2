import type { IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import type { Builder, UnknownAttrs } from "../builder";
import { SbmlCompileError, SbmlCompileInternalError } from "../errors";
import {
  CSYMBOL_DEFINITION_URLS,
  MATHML_CONSTANT_TAGS,
  MATHML_FUNCTION_TAGS,
} from "../mathmlData";
import { Context, popContext, type ContextResult } from "./base";

// TODO: implement <semantics>

type NumberType = "real" | "e-notation" | "integer" | "rational";

type NumberContext = {
  kind: "number";
  type: NumberType;
  base: number;
  first?: number;
  second?: number;
  hasSep: boolean;
};

const updateNumberContext = (context: NumberContext, text: string): void => {
  switch (context.type) {
    case "real": {
      const got = Number(text);
      if (Number.isNaN(got)) {
        throw new SbmlCompileInternalError("Invalid number.");
      }
      context.first = got;
      break;
    }
    case "e-notation": {
      if (context.hasSep) {
        const got = parseInt(text);
        if (Number.isNaN(got)) {
          throw new SbmlCompileInternalError("Invalid integer.");
        }
        context.second = got;
      } else {
        const got = Number(text);
        if (Number.isNaN(got)) {
          throw new SbmlCompileInternalError("Invalid number.");
        }
        context.first = got;
      }
      break;
    }
    case "integer": {
      const got = parseInt(text, context.base);
      if (Number.isNaN(got)) {
        throw new SbmlCompileInternalError("Invalid integer.");
      }
      context.first = got;
      break;
    }
    case "rational": {
      const got = parseInt(text, context.base);
      if (Number.isNaN(got)) {
        throw new SbmlCompileInternalError("Invalid integer.");
      }

      if (context.hasSep) {
        context.second = got;
      } else {
        context.first = got;
      }
      break;
    }
  }
};

const getNumberFromContext = (context: NumberContext): number => {
  switch (context.type) {
    case "real":
      if (context.first === undefined)
        throw new SbmlCompileInternalError("Missing number.");
      return context.first;
    case "e-notation":
      if (context.first === undefined)
        throw new SbmlCompileInternalError("Missing mantissa.");
      if (context.second === undefined)
        throw new SbmlCompileInternalError("Missing exponent.");
      return context.first * context.base ** context.second;
    case "integer":
      if (context.first === undefined)
        throw new SbmlCompileInternalError("Missing integer.");
      return context.first;
    case "rational":
      if (context.first === undefined)
        throw new SbmlCompileInternalError("Missing numerator.");
      if (context.second === undefined)
        throw new SbmlCompileInternalError("Missing denominator.");
      return context.first / context.second;
  }
};

export class MathContext extends Context {
  #stack: IridiumExpression[];
  #applyCounts: number[];
  #inside:
    | { kind: "identifier"; text?: string }
    | NumberContext
    | { kind: "symbol"; url: string }
    | undefined;

  constructor(builder: Builder) {
    super(builder);
    this.#stack = [];
    this.#applyCounts = [];
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    if (this.#applyCounts.length > 0) {
      this.#applyCounts[this.#applyCounts.length - 1] += 1;
    }

    if (name === "apply") {
      this.#applyCounts.push(0);
    } else if (name === "ci") {
      this.#inside = { kind: "identifier" };
    } else if (name === "cn") {
      let type: NumberType = "real";
      if ("type" in attrs) {
        const got = this.builder.getString(attrs, "type");
        if (
          got !== "real" &&
          got !== "e-notation" &&
          got !== "integer" &&
          got !== "rational"
        ) {
          throw new SbmlCompileInternalError("Invalid number type: " + got);
        }
        type = got;
      }

      let base: number = 10;
      if ("base" in attrs) {
        base = this.builder.getNumber(attrs, "base");
        if (base < 2)
          throw new SbmlCompileInternalError(
            "Invalid base. Must be within 2-36.",
          );
        if (base > 36)
          throw new SbmlCompileInternalError(
            "Invalid base. Must be within 2-36.",
          );
      }

      this.#inside = { kind: "number", type, base, hasSep: false };
    } else if (name === "sep") {
      if (this.#inside?.kind === "number") {
        this.#inside.hasSep = true;
      }
    } else if (name === "csymbol") {
      this.#inside = {
        kind: "symbol",
        url: this.builder.getString(attrs, "definitionURL"),
      };
    } else if (
      MATHML_CONSTANT_TAGS.has(name) ||
      MATHML_FUNCTION_TAGS.has(name)
    ) {
      // do nothing
    } else {
      throw new SbmlCompileInternalError("Unsupported math tag.");
    }

    return;
  }

  onText(text: string): ContextResult | undefined {
    switch (this.#inside?.kind) {
      case "identifier":
        this.#inside.text = text.trim();
        break;
      case "number":
        updateNumberContext(this.#inside, text);
        break;
    }
    return;
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name === "math") {
      return popContext(this.#stack.pop());
    } else if (name === "apply") {
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

      if (!func) {
        throw new SbmlCompileInternalError("<apply> is empty.");
      }

      if (func.kind !== "variable") {
        throw new SbmlCompileInternalError("Bad <apply>.");
      }

      if (func.name === "rateOf") {
        if (args.length !== 1) {
          throw new SbmlCompileInternalError(
            "rateOf expects exactly one argument.",
          );
        } else if (args[0].kind !== "variable") {
          throw new SbmlCompileInternalError(
            "The argument to rateOf must be a variable.",
          );
        }
        this.#stack.push(expr.rateOf(args[0].name));
      } else {
        this.#stack.push(expr.call(func.name, args));
      }
    } else if (name === "ci") {
      if (
        this.#inside?.kind === "identifier" &&
        this.#inside.text !== undefined
      ) {
        this.#stack.push(expr.var(this.#inside.text));
      }
    } else if (name === "cn") {
      if (this.#inside?.kind === "number") {
        this.#stack.push(expr.num(getNumberFromContext(this.#inside)));
      }
    } else if (name === "csymbol") {
      if (this.#inside?.kind === "symbol") {
        const expr = CSYMBOL_DEFINITION_URLS.get(this.#inside.url);
        if (expr) {
          this.#stack.push({ ...expr });
        }
      }
    } else if (
      MATHML_CONSTANT_TAGS.has(name) ||
      MATHML_FUNCTION_TAGS.has(name)
    ) {
      this.#stack.push(expr.var(name));
    }
  }
}
