import { CharStreams, CommonTokenStream } from "antlr4ts";
import { AntimonyLexer } from "./generated/AntimonyLexer";
import { AntimonyParser, RootContext } from "./generated/AntimonyParser";

export const createLexerAndParser = (
  code: string,
): [AntimonyLexer, AntimonyParser] => {
  const inputStream = CharStreams.fromString(code);
  const lexer = new AntimonyLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new AntimonyParser(tokenStream);
  return [lexer, parser];
};

export const parse = (code: string): RootContext => {
  const [_lexer, parser] = createLexerAndParser(code);
  return parser.root();
};
