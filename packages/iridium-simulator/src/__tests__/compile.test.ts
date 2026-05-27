import { describe, it, expect } from "vitest";

//import defaultModel from "@/features/__benches__/steve_medium.ant?raw";
import defaultModel from "@/assets/default.ant?raw";
// import defaultModel from "@/assets/examples/BIOMD0000000833.ant?raw";
import { compileIntermediate } from "../compile/compile";
import { writeFileSync } from "node:fs";

// enable this to write a `defaultModel.wasm` file wherever you are.
// useful to use with WABT to analyze the WebAssembly output.
const WRITE_BASIC_MODEL = true;

describe("compiling default model", () => {
  it("should have valid WASM", () => {
    const { bytecode } = compileIntermediate(defaultModel);

    if (WRITE_BASIC_MODEL) {
      writeFileSync("defaultModel.wasm", bytecode);
    }

    expect(WebAssembly.validate(bytecode)).toBe(true);
  });
});
