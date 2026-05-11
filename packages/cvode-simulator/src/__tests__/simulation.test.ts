import { describe, it, expect } from "vitest";
import { createWrapper } from "../wrapper.ts";

import defaultModel from "@/assets/default.ant?raw";
import { compileToSpec } from "../compile/compile";
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

  builder.push("Time\n");

  const rows =
    spec.floatingSpecies.length +
    spec.boundarySpecies.length +
    spec.parameters.length +
    1;

  for (let x = 0; x < numPoints; x++) {
    for (let y = 0; y < rows; y++) {
      builder.push(result[x + numPoints * y].toString());
      if (y < rows - 1) {
        builder.push(",");
      }
    }
    if (x < numPoints - 1) {
      builder.push("\n");
    }
  }

  return builder.join("");
};

describe("simulating basic model", () => {
  it("should match expected output", async () => {
    const wrapper = await createWrapper();
    const spec = await compileToSpec(defaultModel);
    const numPoints = 200;

    console.log(spec);

    await wrapper.setModel(spec);

    console.log(
      resultToString(spec, numPoints, wrapper.simulate(0, 20, numPoints)),
    );
  });
});
