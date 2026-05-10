import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { createLexerAndParser } from "../parse";
import { AntimonyModel } from "./model";
import { DeriveModelListener } from "./DeriveModelListener";

export const deriveModels = (code: string): AntimonyModel[] => {
  const [_lexer, parser] = createLexerAndParser(code);
  const deriveListener = new DeriveModelListener();
  const root = parser.root();

  ParseTreeWalker.DEFAULT.walk(deriveListener, root);

  return deriveListener.getModels();
};
