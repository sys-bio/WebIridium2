import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { createCvodeWrapper } from "../wrapper.ts";

// import defaultModel from "@/features/__benches__/smallbone_xlarge.ant?raw";
import defaultModel from "@/assets/default.ant?raw";
import { compile } from "../compile/compile";
import type { ModelSpec } from "../modelSpec.ts";
import { resultToString } from "./debugUtil.ts";

// Turn this on to write to iridiumResults/.
// Then you can use plotCompare.py script to compare the results with expected.
const WRITE_TEST_OUTPUT = true;

if (WRITE_TEST_OUTPUT) {
  console.log("Writing to iridiumResults/");
}

const simulate = async (
  model: string,
  startTime: number,
  endTime: number,
  numPoints: number,
  absoluteTolerance?: number,
  relativeTolerance?: number,
): Promise<[ModelSpec, Float64Array]> => {
  const wrapper = await createCvodeWrapper();
  const spec = await compile(model);

  await wrapper.setModel(spec);

  if (absoluteTolerance) {
    wrapper.setAbsoluteTolerance(absoluteTolerance);
  }

  if (relativeTolerance) {
    wrapper.setRelativeTolerance(relativeTolerance);
  }

  return [spec, wrapper.simulate(startTime, endTime, numPoints)];
};

describe("simulating basic model", () => {
  it("should not error", async () => {
    await expect(
      (async () => {
        return await simulate(defaultModel, 0, 100, 200);
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

  type TestParams = {
    startTime: number;
    endTime: number;
    numberOfPoints: number;
    absoluteTolerance: number;
    relativeTolerance: number;
  };

  type ResultsObject = Record<string, number[]>;

  const paramRegex = /([A-Za-z]+)=([0-9.e+-]+)/g;
  const parseTestParams = (code: string): TestParams => {
    const params: Record<string, string> = {};

    for (const match of code.matchAll(paramRegex)) {
      params[match[1]] = match[2];
    }

    return {
      startTime: Number(params["start"]),
      endTime: Number(params["end"]),
      numberOfPoints: Number(params["points"]),
      absoluteTolerance: Number(params["atol"]),
      relativeTolerance: Number(params["rtol"]),
    };
  };

  const getResultsFromCsv = (csv: string): ResultsObject => {
    const results: ResultsObject = {};
    const lines = csv.split("\n");
    const columnNames = [];

    for (const name of lines[0].split(",")) {
      results[name] = [];
      columnNames.push(name);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      for (let j = 0; j < values.length; j++) {
        results[columnNames[j]].push(Number(values[j]));
      }
    }

    return results;
  };

  const getResultsFromArray = (
    spec: ModelSpec,
    numPoints: number,
    array: Float64Array,
  ): ResultsObject => {
    const results: ResultsObject = {};

    let i = 0;
    const rowLength = spec.y.length + spec.p.length + spec.reactions.length + 1;

    for (const y of spec.y) {
      if (y.kind === "floating") {
        const column = [];
        for (let j = 0; j < numPoints; j++) {
          column.push(array[j * rowLength + i]);
        }
        results[y.name] = column;
      }

      i += 1;
    }

    return results;
  };

  for (const [fileName, code] of Object.entries(simulationFiles)) {
    const modelName = fileName.replace(".ant", "");
    it(`should simulate ${modelName} correctly`, async () => {
      const csv = simulationResults[modelName + ".csv"] as string;
      expect(csv).toBeDefined();

      const params = parseTestParams(code as string);

      const [spec, array] = await simulate(
        code as string,
        params.startTime,
        params.endTime,
        params.numberOfPoints,
        params.absoluteTolerance,
        params.relativeTolerance,
      );

      const csvResults = getResultsFromCsv(csv);

      if (WRITE_TEST_OUTPUT) {
        // write results to file for debugging
        const resultsDir = path.resolve(
          __dirname,
          "..",
          "..",
          "iridiumResults",
        );
        await fs.mkdir(resultsDir, { recursive: true });

        const base = path.basename(fileName, ".ant");
        const outputPath = path.join(resultsDir, `${base}.csv`);
        await fs.writeFile(
          outputPath,
          resultToString(spec, params.numberOfPoints, array),
        );
      }

      for (const [name, values] of Object.entries(
        getResultsFromArray(spec, params.numberOfPoints, array),
      )) {
        for (let i = 0; i < values.length; i++) {
          const diff =
            Math.abs(csvResults[name][i] - values[i]) /
            Math.max(
              Math.abs(csvResults[name][i]),
              Math.abs(values[i]),
              0.000001,
            );
          expect(diff).toBeLessThanOrEqual(2 * params.relativeTolerance);
        }
      }
    });
  }
});
