import { describe, it, expect } from "vitest";
import { deriveModels } from "antimony-language/semantic";

import defaultModel from "@/assets/default.ant?raw";
import { compileModelsToBytecode } from "../compile/compile";
import { writeFileSync } from "node:fs";

// enable this to write a `defaultModel.wasm` file wherever you are.
// useful to use with WABT to analyze the WebAssembly output.
const WRITE_BASIC_MODEL = true;

describe("compiling basic model", () => {
  it("should be valid WASM", async () => {
    const models = deriveModels(defaultModel);
    const bytecode = compileModelsToBytecode(models);

    if (WRITE_BASIC_MODEL) {
      writeFileSync("defaultModel.wasm", bytecode);
    }

    await expect(WebAssembly.compile(bytecode)).resolves.not.toThrow();
  });
});
