import type { IridiumExpression } from "../../ir/ast";
import type { Builder, UnknownAttrs } from "../builder";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext } from "./math";

export class AlgebraicContext extends Context {
  #id?: string;
  #math: IridiumExpression | undefined;

  constructor(builder: Builder, id?: string) {
    super(builder);
    this.#id = id;
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    if (name === "math") {
      return pushContext(new MathContext(this.builder));
    }
  }

  onPop(_context: Context, result?: unknown): void {
    this.#math = result as IridiumExpression;
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name === "algebraicRule") {
      if (this.#math) {
        this.builder.addAlgebraicRule({
          name: this.#id ?? this.builder.getUniqueAlgebraicRuleId(),
          expression: this.#math,
        });
      }

      return popContext();
    }
  }
}
