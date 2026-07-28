import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import {
  getColumnsFromCsv,
  getColumnsFromTimeCourseOutput,
  parseTestParams,
  simulateOnce,
} from "./testUtil.ts";

// import defaultModel from "@/features/__benches__/smallbone_xlarge.ant?raw";
import defaultModel from "@/assets/default.ant?raw";

// Turn this on then you can use plotCompare.py script to compare the results with expected.
const WRITE_TEST_OUTPUT = true;
const resultsDir = path.resolve(__dirname, "..", "..", "simResults");

if (WRITE_TEST_OUTPUT) {
  console.log(`Writing to ${resultsDir}`);
}

describe("simulating basic model", () => {
  it("should not error", async () => {
    await expect(
      (async () => {
        return await simulateOnce(defaultModel, 0, 100, 200);
      })(),
    ).resolves.toBeDefined();
  });
});

describe("simulation results", () => {
  const simulationFiles = import.meta.glob("./results/*.ant", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const simulationResults = import.meta.glob("./results/*.csv", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  for (const [fileName, code] of Object.entries(simulationFiles)) {
    const modelName = fileName.replace(".ant", "");
    it(`should simulate ${modelName} correctly`, async () => {
      const csv = simulationResults[modelName + ".csv"] as string;
      expect(csv).toBeDefined();

      const params = parseTestParams(code as string);

      const output = await simulateOnce(
        code as string,
        params.startTime,
        params.endTime,
        params.numberOfPoints,
        params.absoluteTolerance,
        params.relativeTolerance,
      );

      const expectedColumns = getColumnsFromCsv(csv);

      const gotColumns = getColumnsFromTimeCourseOutput(output);

      if (WRITE_TEST_OUTPUT) {
        // write results to file for debugging
        await fs.mkdir(resultsDir, { recursive: true });

        const base = path.basename(fileName, ".ant");
        const outputPath = path.join(resultsDir, `${base}.csv`);
        await fs.writeFile(outputPath, output.toCsv());
      }

      for (const [name, column] of Object.entries(expectedColumns)) {
        for (let i = 0; i < column.length; i++) {
          const got = gotColumns[name][i];
          const expected = column[i];
          const diff =
            Math.abs(expected - got) /
            Math.max(Math.abs(expected), Math.abs(got), 1e-3);
          if (diff > 1e-4) {
            throw new Error(
              `${name} too far apart at index ${i}. Expected ${expected}, got ${got}, diff ${diff}.`,
            );
          }
        }
      }
    });
  }
});
