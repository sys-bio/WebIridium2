import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { parse } from "../parse";
import type { AntimonyModel } from "./model";
import { DeriveModelListener } from "./DeriveModelListener";
import type { RootContext } from "../grammar.ts";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

export * from "./model.ts";

/**
 * Pass in optional diagnostics parameter to switch to "diagnostics mode."
 * In this mode, no errors will be thrown, instead they'll be added to the
 * array you passed in.
 */
export const deriveModels = (
  code: string,
  { diagnostics }: { diagnostics?: Error[] } = {},
): AntimonyModel[] => {
  return deriveModelsFromParseTree(parse(code), { diagnostics });
};

export const deriveModelsFromParseTree = (
  root: RootContext,
  { diagnostics }: { diagnostics?: Error[] } = {},
): AntimonyModel[] => {
  const deriveListener = new DeriveModelListener({ diagnostics });
  ParseTreeWalker.DEFAULT.walk(deriveListener as ParseTreeListener, root);
  return deriveListener.getModels();
};
