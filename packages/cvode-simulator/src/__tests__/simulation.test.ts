import { describe, it, expect } from "vitest";
import { createWrapper } from "../wrapper.ts";

import defaultModel from "@/assets/default.ant?raw";
import { compileToSpec } from "../compile/compile";

describe("simulating basic model", () => {
  it("should match expected output", async () => {
    const wrapper = await createWrapper();
    const spec = await compileToSpec(defaultModel);

    console.log(spec);

    await wrapper.setModel(spec);

    console.log(wrapper.resultToString(wrapper.simulate(0, 10, 200)));
  });
});
