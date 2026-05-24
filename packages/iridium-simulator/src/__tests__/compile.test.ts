import { describe, it, expect } from "vitest";

import defaultModel from "@/assets/examples/tau-doyle-integral-controller.txt?raw";
import { compileIntermediate } from "../compile/compile";
import { writeFileSync } from "node:fs";

// enable this to write a `defaultModel.wasm` file wherever you are.
// useful to use with WABT to analyze the WebAssembly output.
const WRITE_BASIC_MODEL = false;

describe("compiling default model", () => {
  it("should have valid WASM", () => {
    const { bytecode } = compileIntermediate(defaultModel);

    if (WRITE_BASIC_MODEL) {
      writeFileSync("defaultModel.wasm", bytecode);
    }

    expect(WebAssembly.validate(bytecode)).toBe(true);
  });
});
