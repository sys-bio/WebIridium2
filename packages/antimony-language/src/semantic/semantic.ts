import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { parse } from "../parse";
import type { AntimonyDocument } from "./model";
import { BuildAntimonyListener } from "./BuildAntimonyListener.ts";
import type { RootContext } from "../grammar.ts";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

export * from "./model.ts";

/**
 * Pass in optional diagnostics parameter to switch to "diagnostics mode."
 * In this mode, no errors will be thrown, instead they'll be added to the
 * array you passed in.
 */
export const buildAntimonyDocument = (
  code: string,
  { diagnostics }: { diagnostics?: Error[] } = {},
): AntimonyDocument => {
  return buildAntimonyFromParseTree(parse(code), { diagnostics });
};

export const buildAntimonyFromParseTree = (
  root: RootContext,
  { diagnostics }: { diagnostics?: Error[] } = {},
): AntimonyDocument => {
  const buildListener = new BuildAntimonyListener({ diagnostics });
  ParseTreeWalker.DEFAULT.walk(buildListener as ParseTreeListener, root);
  return buildListener.getDocument();
};
