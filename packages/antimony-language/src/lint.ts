import { ANTLRErrorListener, CharStreams, CommonTokenStream } from "antlr4ts";
import { AntimonyParser, RootContext } from "./generated/AntimonyParser.ts";
import { AntimonyLexer } from "./generated/AntimonyLexer.ts";

const lintSeverityValues = {
  warning: 1,
  error: 2,
} as const;
export type LintSeverity = keyof typeof lintSeverityValues;

export type Lint = {
  severity: LintSeverity;
  message: string;
  line: number;
  column: number;
};

export const isMoreSevere = (lint1: Lint, lint2: Lint): boolean =>
  lintSeverityValues[lint1.severity] > lintSeverityValues[lint2.severity];

export const lint = (code: string): Lint[] => {
  const inputStream = CharStreams.fromString(code);
  const lexer = new AntimonyLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new AntimonyParser(tokenStream);

  lexer.removeErrorListeners();
  parser.removeErrorListeners();

  const lints: Lint[] = [];

  const errorListener: ANTLRErrorListener<unknown> = {
    syntaxError(
      _recognizer,
      _offendingSymbol,
      line,
      charPositionInLine,
      msg,
      _e,
    ) {
      lints.push({
        severity: "error",
        message: msg,
        line: line,
        column: charPositionInLine,
      });
    },
  };

  lexer.addErrorListener(errorListener);
  parser.addErrorListener(errorListener);

  parser.root();

  return lints;
};
