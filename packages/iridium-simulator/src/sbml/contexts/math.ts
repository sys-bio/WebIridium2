import type { IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import { getNumber, getString, type UnknownAttrs } from "../attrs";
import { SbmlCompileError, SbmlCompileInternalError } from "../errors";
import {
  CSYMBOL_DEFINITION_URLS,
  MATHML_CONSTANT_TAGS,
  MATHML_FUNCTION_TAGS,
} from "../mathmlData";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { SemanticsContext } from "./semantics";

export type MathElement =
  | IridiumExpression
  | { kind: "lambda"; parameters: string[]; body: IridiumExpression }
  | { kind: "bound"; element: MathElement };

type NumberType = "real" | "e-notation" | "integer" | "rational";

export const isIridiumExpressionKind = (
  element: MathElement,
): element is IridiumExpression => {
  return element.kind !== "lambda" && element.kind !== "bound";
};

export const prettifyMathKind = (kind: MathElement["kind"]): string => {
  switch (kind) {
    case "bound":
      return "bound variable";
    default:
      return kind;
  }
};

class NumberContext extends Context {
  #type: NumberType;
  #base: number;
  #first?: number;
  #second?: number;
  #hitSep?: boolean;

  constructor(type: NumberType, base: number) {
    super();
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
        return popContext(expr.num(this.#first), true);
      case "e-notation":
        if (this.#first === undefined)
          throw new SbmlCompileInternalError("Missing mantissa.");
        if (this.#second === undefined)
          throw new SbmlCompileInternalError("Missing exponent.");
        return popContext(
          expr.num(this.#first * this.#base ** this.#second),
          true,
        );
      case "integer":
        if (this.#first === undefined)
          throw new SbmlCompileInternalError("Missing integer.");
        return popContext(expr.num(this.#first), true);
      case "rational":
        if (this.#first === undefined)
          throw new SbmlCompileInternalError("Missing numerator.");
        if (this.#second === undefined)
          throw new SbmlCompileInternalError("Missing denominator.");
        return popContext(expr.num(this.#first / this.#second), true);
    }
  }
}

class IdentifierContext extends Context {
  #text?: string;

  onText(name: string): ContextResult | undefined {
    this.#text = name.trim();
    return;
  }
  onEndElement(name: string): ContextResult | undefined {
    if (name !== "ci")
      throw new SbmlCompileInternalError("Unexpected element.");
    if (this.#text === undefined)
      throw new SbmlCompileInternalError("Missing text.");
    return popContext(expr.var(this.#text), true);
  }
}

class SymbolContext extends Context {
  #url: string;
  constructor(url: string) {
    super();
    this.#url = url;
  }
  onEndElement(name: string): ContextResult | undefined {
    if (name !== "csymbol") return;
    const expr = CSYMBOL_DEFINITION_URLS.get(this.#url);
    if (!expr) throw new SbmlCompileInternalError("Unknown definitionURL");
    return popContext({ ...expr }, true);
  }
}

type Piece = {
  value: IridiumExpression;
  condition: IridiumExpression;
};

export class PiecewiseContext extends Context {
  #pieces: Piece[];
  #otherwise?: IridiumExpression;
  #currentPiece?: Partial<Piece> & {
    isOtherwise: boolean;
  };

  constructor() {
    super();
    this.#pieces = [];
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    if (this.#currentPiece) {
      return pushContext(new MathContext(name), true);
    }

    if (name === "piece" || this.#currentPiece) {
      this.#currentPiece = { isOtherwise: false };
    } else if (name === "otherwise") {
      if (this.#otherwise) {
        throw new SbmlCompileInternalError("Got multiple <otherwise>.");
      }

      this.#currentPiece = { isOtherwise: true };
    }
  }

  onPop(_context: Context, result?: unknown): void {
    const math = result as MathElement;
    if (!isIridiumExpressionKind(math)) {
      throw new SbmlCompileInternalError(
        `Cannot use ${prettifyMathKind(math.kind)} in piecewise.`,
      );
    }

    if (this.#currentPiece) {
      if (!this.#currentPiece.value) {
        this.#currentPiece.value = math;
      } else if (!this.#currentPiece.isOtherwise) {
        this.#currentPiece.condition = math;
      } else {
        throw new SbmlCompileError("Bad result.");
      }
    }
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name === "piece") {
      if (
        this.#currentPiece?.value &&
        this.#currentPiece?.condition &&
        !this.#currentPiece.isOtherwise
      ) {
        this.#pieces.push(this.#currentPiece as Piece);
      } else {
        throw new SbmlCompileInternalError("Bad <piece>.");
      }
      this.#currentPiece = undefined;
    } else if (name === "otherwise") {
      if (this.#currentPiece?.value && this.#currentPiece.isOtherwise) {
        this.#otherwise = this.#currentPiece.value;
      } else {
        throw new SbmlCompileInternalError("Bad <otherwise>.");
      }
    } else if (name === "piecewise") {
      const args = [];

      for (const piece of this.#pieces) {
        args.push(piece.value);
        args.push(piece.condition);
      }

      if (this.#otherwise) {
        args.push(this.#otherwise);
      }

      return popContext(expr.builtinCall("piecewise", args), true);
    }

    return;
  }
}

class LambdaContext extends Context {
  #params: string[] = [];
  #body: IridiumExpression | undefined;
  #isDoneWithParameters: boolean = false;

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    return pushContext(new MathContext(name), true);
  }

  onPop(_context: Context, result?: unknown): void {
    const math = result as MathElement;
    if (math.kind === "bound") {
      if (this.#isDoneWithParameters) {
        throw new SbmlCompileInternalError(
          "Bound variable must occur before the lambda body.",
        );
      }
      if (math.element.kind !== "variable") {
        throw new SbmlCompileInternalError(
          "Bound variable must be an identifier.",
        );
      }

      this.#params.push(math.element.name);
    } else {
      if (this.#body) {
        throw new SbmlCompileInternalError(
          "Lambda may only contain one expression.",
        );
      } else if (!isIridiumExpressionKind(math)) {
        throw new SbmlCompileInternalError(
          `Lambda body may not contain a ${prettifyMathKind(math.kind)}.`,
        );
      }
      this.#body = math;
      this.#isDoneWithParameters = true;
    }
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name === "lambda") {
      if (this.#body) {
        return popContext(
          {
            kind: "lambda",
            parameters: this.#params,
            body: this.#body,
          } satisfies MathElement,
          true,
        );
      } else {
        throw new SbmlCompileInternalError("Lambda must have a body.");
      }
    }
  }
}

class BvarContext extends Context {
  #body: MathElement | undefined;

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    return pushContext(new MathContext(name), true);
  }

  onPop(_context: Context, result?: unknown): void {
    if (this.#body) {
      throw new SbmlCompileInternalError(
        "Bound variable should only have on child.",
      );
    } else {
      this.#body = result as MathElement;
    }
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name === "bvar") {
      if (!this.#body) {
        throw new SbmlCompileInternalError(
          "Bound variable must contain something.",
        );
      }
      return popContext({ kind: "bound", element: this.#body }, true);
    }
  }
}

export class MathContext extends Context {
  #stack: MathElement[];
  #applyCounts: number[];
  #stopOn: string;

  constructor(stopOn: string = "math") {
    super();
    this.#stack = [];
    this.#applyCounts = [];
    this.#stopOn = stopOn;
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    if (this.#applyCounts.length > 0) {
      this.#applyCounts[this.#applyCounts.length - 1] += 1;
    }

    if (name === "apply") {
      this.#applyCounts.push(0);
    } else if (name === "ci") {
      return pushContext(new IdentifierContext());
    } else if (name === "cn") {
      let type: NumberType = "real";
      if ("type" in attrs) {
        const got = getString(attrs, "type");
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
        base = getNumber(attrs, "base");
        if (base < 2)
          throw new SbmlCompileInternalError(
            "Invalid base. Must be within 2-36.",
          );
        if (base > 36)
          throw new SbmlCompileInternalError(
            "Invalid base. Must be within 2-36.",
          );
      }

      return pushContext(new NumberContext(type, base));
    } else if (name === "csymbol") {
      return pushContext(new SymbolContext(getString(attrs, "definitionURL")));
    } else if (name === "piecewise") {
      return pushContext(new PiecewiseContext());
    } else if (name === "logbase") {
      const last = this.#stack[this.#stack.length - 1];
      if (
        last?.kind !== "builtinVariable" ||
        last.name !== "log" ||
        this.#applyCounts[this.#applyCounts.length - 1] !== 2
      ) {
        throw new SbmlCompileInternalError(
          "<logbase> must be the second argument of a <log> application.",
        );
      }
      return pushContext(new MathContext("logbase"), false);
    } else if (name === "degree") {
      const last = this.#stack[this.#stack.length - 1];
      if (
        last?.kind !== "builtinVariable" ||
        last.name !== "root" ||
        this.#applyCounts[this.#applyCounts.length - 1] !== 2
      ) {
        throw new SbmlCompileInternalError(
          "<degree> must be the second argument of a <root> application.",
        );
      }
      return pushContext(new MathContext("degree"));
    } else if (name === "lambda") {
      return pushContext(new LambdaContext());
    } else if (name === "bvar") {
      return pushContext(new BvarContext());
    } else if (name === "semantics") {
      return pushContext(new SemanticsContext());
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
      this.#stack.push(result as MathElement);
    }
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

        if (!isIridiumExpressionKind(got)) {
          throw new SbmlCompileInternalError(
            `Cannot use ${prettifyMathKind(got.kind)} in <apply>. Create a function definition then refer to that.`,
          );
        }

        children.push(got);
      }

      children.reverse();

      const func = children[0];
      const args = children.slice(1);

      if (!func) {
        throw new SbmlCompileInternalError("<apply> is empty.");
      }

      if (func.kind !== "variable" && func.kind !== "builtinVariable") {
        throw new SbmlCompileInternalError("Bad <apply>.");
      }

      if (func.kind === "builtinVariable" && func.name === "rateOf") {
        if (args.length !== 1) {
          throw new SbmlCompileInternalError(
            "rateOf expects exactly one argument.",
          );
        } else if (args[0].kind !== "variable") {
          throw new SbmlCompileInternalError(
            "The argument to rateOf must be a symbol inside the model.",
          );
        }
        this.#stack.push(expr.rateOf(args[0].name));
      } else if (func.kind === "builtinVariable") {
        this.#stack.push(expr.builtinCall(func.name, args));
      } else {
        this.#stack.push(expr.call(func.name, args));
      }
    } else if (
      MATHML_CONSTANT_TAGS.has(name) ||
      MATHML_FUNCTION_TAGS.has(name)
    ) {
      this.#stack.push(expr.builtinVar(name));
    }

    if (name === this.#stopOn) {
      if (name === "apply" && this.#stack.length !== 1) {
        return;
      } else if (name !== "apply" && this.#stack.length !== 1) {
        throw new SbmlCompileInternalError("Ill-formed math.");
      }

      return popContext(this.#stack[0]);
    }
  }
}
