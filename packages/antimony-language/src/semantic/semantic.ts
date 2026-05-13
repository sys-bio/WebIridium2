import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { parse } from "../parse";
import type { AntimonyModel } from "./model";
import { DeriveModelListener } from "./DeriveModelListener";
import type { RootContext } from "../grammar.ts";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

export * from "./model.ts";

export const deriveModels = (code: string): AntimonyModel[] => {
  return deriveModelsFromParseTree(parse(code));
};

export const deriveModelsFromParseTree = (
  root: RootContext,
): AntimonyModel[] => {
  const deriveListener = new DeriveModelListener();
  ParseTreeWalker.DEFAULT.walk(deriveListener as ParseTreeListener, root);
  return deriveListener.getModels();
};
