import type { Builder, UnknownAttrs } from "../builder";

export type ContextResult =
  | { kind: "push"; context: Context; shouldRepeatLastEvent: boolean }
  | { kind: "pop"; value?: unknown; shouldRepeatLastEvent: boolean };

export const pushContext = (
  context: Context,
  shouldRepeatLastEvent = false,
): ContextResult => {
  return { kind: "push", context, shouldRepeatLastEvent };
};

export const popContext = (
  value?: unknown,
  shouldRepeatLastEvent = false,
): ContextResult => {
  return { kind: "pop", value, shouldRepeatLastEvent };
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
