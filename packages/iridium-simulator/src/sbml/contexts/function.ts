import type { UnknownAttrs } from "../attrs";
import type { Builder } from "../builder";
import { SbmlCompileInternalError } from "../errors";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext, type MathElement } from "./math";

export class FunctionContext extends Context {
  #builder: Builder;
  #id: string;
  #body?: Extract<MathElement, { kind: "lambda" }>;

  constructor(builder: Builder, id: string) {
    super();
    this.#builder = builder;
    this.#id = id;
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    if (name === "math") {
      return pushContext(new MathContext());
    }
  }

  onPop(_context: Context, result?: unknown): void {
    const math = result as MathElement;
    if (math.kind !== "lambda") {
      throw new SbmlCompileInternalError(
        "Function definition must contain a lambda.",
      );
    }
    this.#body = math;
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name === "functionDefinition") {
      // TODO: allow function bodies in the ir to be empty
      if (this.#body) {
        this.#builder.addFunction({
          name: this.#id,
          parameters: this.#body.parameters,
          body: this.#body?.body,
        });
      }
      return popContext();
    }
  }
}
