import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";

// import defaultModel from "@/features/__benches__/smallbone_xlarge.ant?raw";
import defaultModel from "@/assets/default.ant?raw";
import type { TimeCourseOutput } from "../../runtime/output.ts";
import { createSimulator } from "../../runtime/simulator.ts";
import { buildAntimonyDocument } from "../semantic/semantic.ts";
import { compileAntimonyDocument } from "../compile/compile.ts";
import { compile } from "../../compile/compile.ts";
import {
  getColumnsFromCsv,
  getColumnsFromTimeCourseOutput,
  parseTestParams,
} from "../../testingUtils/simTests.ts";

// Turn this on then you can use plotCompare.py script to compare the results with expected.
const WRITE_TEST_OUTPUT = true;
const resultsDir = path.resolve(__dirname, "..", "..", "..", "simResults");

if (WRITE_TEST_OUTPUT) {
  console.log(`Writing to ${resultsDir}`);
}

const simulateOnce = async (
  model: string,
  startTime: number,
  endTime: number,
  numPoints: number,
  absoluteTolerance?: number,
  relativeTolerance?: number,
): Promise<TimeCourseOutput> => {
  const simulator = await createSimulator();
  const document = buildAntimonyDocument(model);
  const ir = compileAntimonyDocument(document);
  const runtimeModel = await compile(ir);

  await simulator.setModel(runtimeModel);

  if (absoluteTolerance) {
    simulator.setAbsoluteTolerance(absoluteTolerance);
  }

  if (relativeTolerance) {
    simulator.setRelativeTolerance(relativeTolerance);
  }

  const output = simulator.simulate(startTime, endTime, numPoints);

  return output;
};

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
  const simulationFiles = import.meta.glob("./timeCourses/*.ant", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const simulationResults = import.meta.glob("./timeCourses/*.csv", {
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
