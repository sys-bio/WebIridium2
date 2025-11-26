import { describe, it, expect } from "vitest";
import { ANTLRErrorListener, CharStreams, CommonTokenStream } from "antlr4ts";
import { AntimonyLexer } from "../grammar/AntimonyLexer.ts";
import { AntimonyParser } from "../grammar/AntimonyParser";

const parse = (code: string) => {
  const inputStream = CharStreams.fromString(code);
  const lexer = new AntimonyLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new AntimonyParser(tokenStream);

  lexer.removeErrorListeners();
  parser.removeErrorListeners();

  const errorListener: ANTLRErrorListener<unknown> = {
    syntaxError: (
      _recognizer,
      offendingSymbol,
      line,
      charPositionInLine,
      msg,
      _,
    ) => {
      throw new Error(
        `${offendingSymbol} line ${line} pos ${charPositionInLine}: ${msg}`,
      );
    },
  };

  lexer.addErrorListener(errorListener);
  parser.addErrorListener(errorListener);

  parser.root();
};

describe("good models", () => {
  const goodModels: Record<string, string> = import.meta.glob(
    "./good-parse/*.ant",
    {
      eager: true,
      query: "?raw",
      import: "default",
    },
  );

  for (const [name, code] of Object.entries(goodModels)) {
    it(`${name} should not error`, () => {
      expect(() => {
        parse(code);
      }).not.toThrow();
    });
  }
});

describe("bad models", () => {
  const badModels: Record<string, string> = import.meta.glob(
    "./bad-parse/*.ant",
    {
      eager: true,
      query: "?raw",
      import: "default",
    },
  );

  for (const [name, code] of Object.entries(badModels)) {
    it(`${name} should not error`, () => {
      expect(() => {
        parse(code);
      }).toThrow();
    });
  }
});
