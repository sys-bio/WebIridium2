import { SaxParser } from "@nodable/sax";
import type { Context, ContextResult } from "./contexts/base";
import { SbmlCompileError, SbmlCompileInternalError } from "./errors";
import { Builder, type UnknownAttrs } from "./builder";
import { SbmlContext } from "./contexts/sbml";
import type { IridiumModel } from "../ir/model";

export const compileSbml = (sbmlText: string): IridiumModel => {
  const contexts: Context[] = [];
  const builder = new Builder();

  const applyResult = (result: ContextResult | undefined): void => {
    if (result?.kind === "push") {
      contexts.push(result.context);
    } else if (result?.kind === "pop") {
      const last = contexts.pop();

      const current = contexts[contexts.length - 1];
      if (current && last) {
        current.onPop?.(last, result.value);
      }
    }
  };

  const parser = new SaxParser({
    fxpOptions: {
      skip: {
        attributes: false,
      },
    },
    onStartElement(name, attrs) {
      try {
        if (contexts.length > 0) {
          const current = contexts[contexts.length - 1];
          applyResult(current.onStartElement(name, attrs as UnknownAttrs));
        } else {
          if (name === "sbml") {
            if (attrs.level === "3" && attrs.version === "2") {
              applyResult({ kind: "push", context: new SbmlContext(builder) });
            } else {
              throw new SbmlCompileInternalError(
                `Not supported. Level: ${attrs.level as string}. Version: ${attrs.version as string}.`,
              );
            }
          }
        }
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
      if (contexts.length > 0) {
        const current = contexts[contexts.length - 1];
        if (current.onText) {
          applyResult(current.onText(text));
        }
      }
    },
    onEndElement(name, _closeMeta) {
      if (contexts.length > 0) {
        const current = contexts[contexts.length - 1];
        if (current.onEndElement) {
          applyResult(current.onEndElement(name));
        }
      }
    },
  });

  parser.parse(sbmlText);

  return builder.ir;
};
