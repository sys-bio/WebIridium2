import type { IridiumExpression } from "../../ir/ast";
import type { Builder, UnknownAttrs } from "../builder";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext } from "./math";
import { SbmlCompileInternalError } from "../errors";

export type RuleKind = "initial" | "rate" | "assignment";

export class RuleContext extends Context {
  #kind: RuleKind;
  #math?: IridiumExpression;
  #symbol: string;

  constructor(builder: Builder, kind: RuleKind, symbol: string) {
    super(builder);
    this.#kind = kind;
    this.#symbol = symbol;
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    if (name === "math") {
      return pushContext(new MathContext(this.builder));
    }
  }

  onPop(_context: Context, value: unknown): void {
    this.#math = value as IridiumExpression;
  }

  #getTag(): string {
    switch (this.#kind) {
      case "initial":
        return "initialAssignment";
      case "rate":
        return "rateRule";
      case "assignment":
        return "assignmentRule";
    }
  }

  onEndElement(tagName: string): ContextResult | undefined {
    if (tagName === this.#getTag()) {
      const variable =
        this.builder.parameters.get(this.#symbol) ??
        this.builder.species.get(this.#symbol) ??
        this.builder.compartments.get(this.#symbol) ??
        this.builder.speciesReferences.get(this.#symbol);

      console.log(this.builder.parameters);

      if (!variable) {
        throw new SbmlCompileInternalError(`Cannot assign to ${this.#symbol}.`);
      }

      if (this.#math) {
        if (this.#kind === "initial") {
          variable.value = {
            kind: variable.value.kind === "reaction" ? "reaction" : "initial",
            initial: this.#math,
          };
        }
      }

      return popContext();
    }
  }
}
