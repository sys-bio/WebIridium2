import type { IridiumExpression } from "../../ir/ast";
import type { Builder } from "../builder";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext } from "./math";
import { SbmlCompileInternalError } from "../errors";
import type { UnknownAttrs } from "../attrs";

export type AssignmentKind = "initial" | "rate" | "assignment";

export class AssignmentContext extends Context {
  #builder: Builder;
  #kind: AssignmentKind;
  #math?: IridiumExpression;
  #symbol: string;

  constructor(builder: Builder, kind: AssignmentKind, symbol: string) {
    super();
    this.#builder = builder;
    this.#kind = kind;
    this.#symbol = symbol;
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    if (name === "math") {
      return pushContext(new MathContext());
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
      const variable = this.#builder.getVariable(this.#symbol);

      if (!variable) {
        // spec states to just ignore it
        // since we don't implement full validation, no need to throw if its a reaction or anything
        return popContext();
      }

      if (this.#math) {
        switch (this.#kind) {
          case "initial":
            if (variable.value.kind === "rate") {
              variable.value.initial = this.#math;
            } else if (
              variable.value.kind === "initial" ||
              variable.value.kind === "reaction" ||
              variable.value.kind === "algebraic"
            ) {
              variable.value.initial = this.#math;
            }
            break;
          case "assignment":
            if (this.#builder.isConstant(this.#symbol))
              throw new SbmlCompileInternalError(
                "Constant objects cannot have assignment rules.",
              );
            if (variable.value.kind === "rate")
              throw new SbmlCompileInternalError(
                "Object cannot be simultaneously defined by a rate rule and an assignment rule.",
              );
            variable.value = {
              kind: "assignment",
              assignment: this.#math,
            };
            break;
          case "rate":
            if (this.#builder.isConstant(this.#symbol))
              throw new SbmlCompileInternalError(
                "Constant objects cannot have rate rules.",
              );
            if (variable.value.kind === "assignment")
              throw new SbmlCompileInternalError(
                "Object cannot be simultaneously defined by a rate rule and an assignment rule.",
              );
            variable.value = {
              kind: "rate",
              initial: variable.value.initial,
              rate: this.#math,
            };
            break;
        }
      }

      return popContext();
    }
  }
}
