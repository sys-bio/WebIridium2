import { CharStreams, CommonTokenStream } from "antlr4ts";
import { AntimonyLexer } from "./generated/AntimonyLexer";
import { AntimonyParser } from "./generated/AntimonyParser";

export const createLexerAndParser = (
  code: string,
): [AntimonyLexer, AntimonyParser] => {
  const inputStream = CharStreams.fromString(code);
  const lexer = new AntimonyLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new AntimonyParser(tokenStream);
  return [lexer, parser];
};
