import { describe, it, expect } from "vitest";
import {
  type ANTLRErrorListener,
  CharStreams,
  CommonTokenStream,
} from "antlr4ts";
import { AntimonyLexer } from "../generated/AntimonyLexer.ts";
import { AntimonyParser } from "../generated/AntimonyParser";

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
        // eslint-disable-next-line
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

describe("examples", () => {
  const exampleModels: Record<string, string> = import.meta.glob(
    // feels wrong to grab files from a different package, but whatever
    "@/assets/examples/*.ant",
    {
      eager: true,
      query: "?raw",
      import: "default",
    },
  );

  for (const [name, code] of Object.entries(exampleModels)) {
    it(`${name} should not error`, () => {
      expect(() => {
        parse(code);
      }).not.toThrow();
    });

    it(`${name} should error when prefixed with "model"`, () => {
      expect(() => {
        parse("model\n" + code);
      }).toThrow();
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
    it(`${name} should error`, () => {
      expect(() => {
        parse(code);
      }).toThrow();
    });
  }
});
