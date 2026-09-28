import { SaxBuilder, SaxParser } from "@nodable/sax";
import { Context, pushContext, type ContextResult } from "./contexts/base";
import { SbmlCompileError, SbmlCompileInternalError } from "./errors";
import { Builder } from "./builder";
import { SbmlContext } from "./contexts/sbml";
import type { IridiumModel } from "../ir/model";
import type { UnknownAttrs } from "./attrs";

export class ContextStateMachine {
  #contexts: Context[] = [];

  constructor(defaultContext: Context) {
    this.#contexts = [defaultContext];
  }

  applyResult(result: ContextResult | undefined): boolean {
    if (result?.kind === "push") {
      this.#contexts.push(result.context);
      return result.shouldRepeatLastEvent;
    } else if (result?.kind === "pop") {
      const last = this.#contexts.pop();

      const current = this.#contexts[this.#contexts.length - 1];
      if (!current) {
        throw new SbmlCompileInternalError("Invalid state: no more contexts.");
      }

      if (current && last) {
        current.onPop?.(last, result.value);
      }

      return result.shouldRepeatLastEvent;
    }

    return false;
  }

  getParserOptions() {
    const contexts = this.#contexts;
    const applyResult = this.applyResult.bind(this);

    const onStart = (
      sax: SaxBuilder,
      name: string,
      attrs: UnknownAttrs,
    ): void => {
      try {
        const current = contexts[contexts.length - 1];
        const shouldRepeat = applyResult(current.onStartElement?.(name, attrs));
        if (shouldRepeat) {
          onStart(sax, name, attrs);
        }
      } catch (err) {
        if (err instanceof SbmlCompileInternalError) {
          throw new SbmlCompileError(
            // eslint-disable-next-line
            `at ${sax.matcher!.toString()}: ${err.message}`,
          );
        }

        throw err;
      }
    };

    const onText = (sax: SaxBuilder, text: string): void => {
      try {
        const current = contexts[contexts.length - 1];
        const shouldRepeat = applyResult(current.onText?.(text));
        if (shouldRepeat) {
          onText(sax, text);
        }
      } catch (err) {
        if (err instanceof SbmlCompileInternalError) {
          throw new SbmlCompileError(
            // eslint-disable-next-line
            `at ${sax.matcher!.toString()}: ${err.message}`,
          );
        }

        throw err;
      }
    };

    const onEnd = (sax: SaxBuilder, name: string): void => {
      try {
        const current = contexts[contexts.length - 1];
        const shouldRepeat = applyResult(current.onEndElement?.(name));
        if (shouldRepeat) {
          onEnd(sax, name);
        }
      } catch (err) {
        if (err instanceof SbmlCompileInternalError) {
          throw new SbmlCompileError(
            // eslint-disable-next-line
            `at ${sax.matcher!.toString()}: ${err.message}`,
          );
        }

        throw err;
      }
    };

    return {
      fxpOptions: {
        skip: {
          attributes: false,
        },
      },

      onStartElement(name, attrs) {
        onStart(this, name, attrs as UnknownAttrs);
      },
      onText(text) {
        onText(this, text);
      },
      onEndElement(name, _closeMeta) {
        onEnd(this, name);
      },
    } as ConstructorParameters<typeof SaxParser>[0];
  }
}

class CompileContext extends Context {
  #builder: Builder;

  constructor(builder: Builder) {
    super();
    this.#builder = builder;
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    if (name === "sbml") {
      if (attrs.level === "3" && attrs.version === "2") {
        return pushContext(new SbmlContext(this.#builder));
      } else {
        throw new SbmlCompileInternalError(
          `Not supported. Level: ${attrs.level}. Version: ${attrs.version}.`,
        );
      }
    }
  }
}

export const compileSbml = (sbmlText: string): IridiumModel => {
  const builder = new Builder();
  const stateMachine = new ContextStateMachine(new CompileContext(builder));

  const parser = new SaxParser(stateMachine.getParserOptions());

  parser.parse(sbmlText);

  return builder.getOutput();
};
