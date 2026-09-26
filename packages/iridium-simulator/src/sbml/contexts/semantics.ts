import type { IridiumExpression } from "../../ir/ast";
import type { Builder, UnknownAttrs } from "../builder";
import { SbmlCompileInternalError } from "../errors";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext } from "./math";

export class SemanticsContext extends Context {
  #first?: IridiumExpression;
  #annotationXmlCount: number;

  constructor(builder: Builder) {
    super(builder);
    this.#annotationXmlCount = 0;
  }

  onStartElement(
    name: string,
    _attrs: UnknownAttrs,
  ): ContextResult | undefined {
    if (!this.#first) {
      return pushContext(new MathContext(this.builder, name), true);
    } else if (name === "annotation") {
      // do nothing
    } else if (name === "annotation-xml") {
      this.#annotationXmlCount += 1;
    } else if (this.#annotationXmlCount > 0) {
      // do nothing
    } else {
      throw new SbmlCompileInternalError("Unsupported semantic element.");
    }
  }

  onPop(_context: Context, result?: unknown): void {
    this.#first = result as IridiumExpression;
  }

  onEndElement(name: string): ContextResult | undefined {
    if (name !== "semantics" || this.#annotationXmlCount > 0) {
      if (name === "annotation-xml") {
        this.#annotationXmlCount -= 1;
      }
      return;
    }

    if (!this.#first) {
      throw new SbmlCompileInternalError("Missing first child.");
    }

    return popContext(this.#first);
  }
}
