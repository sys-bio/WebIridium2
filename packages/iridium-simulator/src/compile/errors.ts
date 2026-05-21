import type { ParseTree } from "antlr4ts/tree/ParseTree";

export type CompileErrorInfo = {
  tree?: ParseTree;
};

export class CompileError extends Error {
  info?: CompileErrorInfo;

  constructor(message: string, info?: CompileErrorInfo) {
    super(message);
    this.info = info;
  }
}
