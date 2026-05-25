import type { ParseTree } from "antlr4ts/tree/ParseTree";

export type ParseTreeErrorInfo = {
  tree?: ParseTree;
};

export class ParseTreeError extends Error {
  info?: ParseTreeErrorInfo;

  constructor(message: string, info: ParseTreeErrorInfo) {
    super(message);
    this.info = info;
  }
}

export class SemanticError extends ParseTreeError {}
