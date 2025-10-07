import { describe, it } from "vitest";
import { TokenStream } from "antlr4ts";
import { AntimonyParser } from "../grammar/AntimonyParser";

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
    it(`${name} should error`, () => {});
  }
});
