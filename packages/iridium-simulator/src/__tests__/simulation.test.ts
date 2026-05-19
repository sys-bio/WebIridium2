import { describe, it, expect } from "vitest";
import { createCvodeWrapper } from "../wrapper.ts";

import defaultModel from "@/assets/default.ant?raw";
import { compile } from "../compile/compile";
import type { ModelSpec } from "../modelSpec.ts";

const resultToString = (
  spec: ModelSpec,
  numPoints: number,
  result: Float64Array,
): string => {
  const builder: string[] = [];

  for (const floating of spec.floatingSpecies) {
    builder.push(floating.name);
    builder.push(",");
  }

  for (const boundary of spec.boundarySpecies) {
    builder.push(boundary.name);
    builder.push(",");
  }

  for (const parameter of spec.parameters) {
    builder.push(parameter.name);
    builder.push(",");
  }

  for (const reaction of spec.reactions) {
    builder.push(reaction);
    builder.push(",");
  }

  builder.push("Time\n");

  const cols =
    spec.floatingSpecies.length +
    spec.boundarySpecies.length +
    spec.parameters.length +
    spec.reactions.length +
    1;

  for (let y = 0; y < numPoints; y++) {
    for (let x = 0; x < cols; x++) {
      builder.push(result[x + cols * y].toString());
      if (x < cols - 1) {
        builder.push(",");
      }
    }
    if (y < numPoints - 1) {
      builder.push("\n");
    }
  }

  return builder.join("");
};

describe("simulating basic model", () => {
  it("should match expected output", async () => {
    const wrapper = await createCvodeWrapper();
    const spec = await compile(defaultModel);
    const numPoints = 200;

    await wrapper.setModel(spec);

    console.log(
      resultToString(spec, numPoints, wrapper.simulate(0, 20, numPoints)),
    );
  });
});
