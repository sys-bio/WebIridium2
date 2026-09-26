import type { Builder, UnknownAttrs } from "../builder";

export type ContextResult =
  | { kind: "push"; context: Context }
  | { kind: "pop"; value?: unknown };

export const pushContext = (context: Context): ContextResult => {
  return { kind: "push", context };
};

export const popContext = (value?: unknown): ContextResult => {
  return { kind: "pop", value };
};

export abstract class Context {
  builder: Builder;

  constructor(builder: Builder) {
    this.builder = builder;
  }

  onStartElement?(name: string, attrs: UnknownAttrs): ContextResult | undefined;
  onText?(text: string): ContextResult | undefined;
  onEndElement?(name: string): ContextResult | undefined;

  onPop?(context: Context, result?: unknown): void;
}
