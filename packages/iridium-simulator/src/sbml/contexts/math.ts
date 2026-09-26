import type { IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import type { Builder, UnknownAttrs } from "../builder";
import { SbmlCompileError, SbmlCompileInternalError } from "../errors";
import {
  CSYMBOL_DEFINITION_URLS,
  MATHML_CONSTANT_TAGS,
  MATHML_FUNCTION_TAGS,
} from "../mathmlData";
import { Context, popContext, pushContext, type ContextResult } from "./base";

// TODO: implement <semantics>

type NumberType = "real" | "e-notation" | "integer" | "rational";

class NumberContext extends Context {
  #type: NumberType;
  #base: number;
  #first?: number;
  #second?: number;
  #hitSep?: boolean;

  constructor(builder: Builder, type: NumberType, base: number) {
    super(builder);
    this.#type = type;
    this.#base = base;
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    if (name === "sep") {
      if (this.#hitSep) {
        throw new SbmlCompileInternalError("Found an extra <sep />.");
      }
      this.#hitSep = true;
    } else {
      throw new SbmlCompileError("Unexpected element.");
    }
    return;
  }

  onText(text: string): ContextResult | undefined {
    switch (this.#type) {
      case "real": {
        const got = Number(text);
        if (Number.isNaN(got)) {
          throw new SbmlCompileInternalError("Invalid number.");
        }
        this.#first = got;
        break;
      }
      case "e-notation": {
        if (this.#hitSep) {
          const got = parseInt(text);
          if (Number.isNaN(got)) {
            throw new SbmlCompileInternalError("Invalid integer.");
          }
          this.#second = got;
        } else {
          const got = Number(text);
          if (Number.isNaN(got)) {
            throw new SbmlCompileInternalError("Invalid number.");
          }
          this.#first = got;
        }
        break;
      }
      case "integer": {
        const got = parseInt(text, this.#base);
        if (Number.isNaN(got)) {
          throw new SbmlCompileInternalError("Invalid integer.");
        }
        this.#first = got;
        break;
      }
      case "rational": {
        const got = parseInt(text, this.#base);
        if (Number.isNaN(got)) {
          throw new SbmlCompileInternalError("Invalid integer.");
        }

        if (this.#hitSep) {
          this.#second = got;
        } else {
          this.#first = got;
        }
        break;
      }
    }
    return;
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name !== "cn") return;
    switch (this.#type) {
      case "real":
        if (this.#first === undefined)
          throw new SbmlCompileInternalError("Missing number.");
        return popContext(expr.num(this.#first));
      case "e-notation":
        if (this.#first === undefined)
          throw new SbmlCompileInternalError("Missing mantissa.");
        if (this.#second === undefined)
          throw new SbmlCompileInternalError("Missing exponent.");
        return popContext(expr.num(this.#first * this.#base ** this.#second));
      case "integer":
        if (this.#first === undefined)
          throw new SbmlCompileInternalError("Missing integer.");
        return popContext(expr.num(this.#first));
      case "rational":
        if (this.#first === undefined)
          throw new SbmlCompileInternalError("Missing numerator.");
        if (this.#second === undefined)
          throw new SbmlCompileInternalError("Missing denominator.");
        return popContext(expr.num(this.#first / this.#second));
    }
  }
}

export class IdentifierContext extends Context {
  #text?: string;
  constructor(builder: Builder) {
    super(builder);
  }
  onText(name: string): ContextResult | undefined {
    this.#text = name.trim();
    return;
  }
  onEndElement(name: string): ContextResult | undefined {
    if (name !== "ci")
      throw new SbmlCompileInternalError("Unexpected element.");
    if (this.#text === undefined)
      throw new SbmlCompileInternalError("Missing text.");
    return popContext(expr.var(this.#text));
  }
}

export class SymbolContext extends Context {
  #url: string;
  constructor(builder: Builder, url: string) {
    super(builder);
    this.#url = url;
  }
  onEndElement(name: string): ContextResult | undefined {
    if (name !== "csymbol") return;
    const expr = CSYMBOL_DEFINITION_URLS.get(this.#url);
    if (!expr) throw new SbmlCompileInternalError("Unknown definitionURL");
    return popContext({ ...expr });
  }
}

export class MathContext extends Context {
  #stack: IridiumExpression[];
  #applyCounts: number[];

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
      return pushContext(new IdentifierContext(this.builder));
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

      return pushContext(new NumberContext(this.builder, type, base));
    } else if (name === "csymbol") {
      return pushContext(
        new SymbolContext(
          this.builder,
          this.builder.getString(attrs, "definitionURL"),
        ),
      );
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

  onPop(_context: Context, result?: unknown): void {
    if (result) {
      this.#stack.push(result as IridiumExpression);
    }
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
    } else if (
      MATHML_CONSTANT_TAGS.has(name) ||
      MATHML_FUNCTION_TAGS.has(name)
    ) {
      this.#stack.push(expr.var(name));
    }
  }
}
