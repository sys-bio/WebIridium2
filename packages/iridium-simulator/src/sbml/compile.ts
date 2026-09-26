import { SaxParser } from "@nodable/sax";
import { Context, pushContext, type ContextResult } from "./contexts/base";
import { SbmlCompileError, SbmlCompileInternalError } from "./errors";
import { Builder, type UnknownAttrs } from "./builder";
import { SbmlContext } from "./contexts/sbml";
import type { IridiumModel } from "../ir/model";

export class ContextStateMachine {
  #contexts: Context[] = [];

  constructor(defaultContext: Context) {
    this.#contexts = [defaultContext];
  }

  applyResult(result: ContextResult | undefined): void {
    if (result?.kind === "push") {
      this.#contexts.push(result.context);
    } else if (result?.kind === "pop") {
      const last = this.#contexts.pop();

      const current = this.#contexts[this.#contexts.length - 1];
      if (!current) {
        throw new SbmlCompileInternalError("Invalid state: no more contexts.");
      }

      if (current && last) {
        current.onPop?.(last, result.value);
      }
    }
  }

  getParserOptions() {
    const contexts = this.#contexts;
    const applyResult = this.applyResult.bind(this);

    return {
      fxpOptions: {
        skip: {
          attributes: false,
        },
      },

      onStartElement(name, attrs) {
        try {
          const current = contexts[contexts.length - 1];
          applyResult(current.onStartElement?.(name, attrs as UnknownAttrs));
        } catch (err) {
          if (err instanceof SbmlCompileInternalError) {
            throw new SbmlCompileError(
              // eslint-disable-next-line
              `at ${this.matcher!.toString()}: ${err.message}`,
            );
          }

          throw err;
        }
      },
      onText(text) {
        try {
          const current = contexts[contexts.length - 1];
          applyResult(current.onText?.(text));
        } catch (err) {
          if (err instanceof SbmlCompileInternalError) {
            throw new SbmlCompileError(
              // eslint-disable-next-line
              `at ${this.matcher!.toString()}: ${err.message}`,
            );
          }

          throw err;
        }
      },
      onEndElement(name, _closeMeta) {
        try {
          const current = contexts[contexts.length - 1];
          applyResult(current.onEndElement?.(name));
        } catch (err) {
          if (err instanceof SbmlCompileInternalError) {
            throw new SbmlCompileError(
              // eslint-disable-next-line
              `at ${this.matcher!.toString()}: ${err.message}`,
            );
          }

          throw err;
        }
      },
    } as ConstructorParameters<typeof SaxParser>[0];
  }
}

class DefaultSbmlContext extends Context {
  constructor(builder: Builder) {
    super(builder);
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    if (name === "sbml") {
      if (attrs.level === "3" && attrs.version === "2") {
        return pushContext(new SbmlContext(this.builder));
      } else {
        throw new SbmlCompileInternalError(
          `Not supported. Level: ${attrs.level as string}. Version: ${attrs.version as string}.`,
        );
      }
    }
  }
}

export const compileSbml = (sbmlText: string): IridiumModel => {
  const builder = new Builder();
  const stateMachine = new ContextStateMachine(new DefaultSbmlContext(builder));

  const parser = new SaxParser(stateMachine.getParserOptions());

  parser.parse(sbmlText);

  return builder.ir;
};
