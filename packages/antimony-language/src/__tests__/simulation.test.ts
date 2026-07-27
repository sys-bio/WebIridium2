import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { createCvodeSimulator, type TimeCourseOutput } from "iridium-simulator";
import { compile } from "../compile/compile.ts";

// import defaultModel from "@/features/__benches__/smallbone_xlarge.ant?raw";
import defaultModel from "@/assets/default.ant?raw";

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
): Promise<TimeCourseOutput> => {
  const simulator = await createCvodeSimulator();
  const runtimeModel = await compile(model);

  await simulator.setModel(runtimeModel);

  if (absoluteTolerance) {
    simulator.setAbsoluteTolerance(absoluteTolerance);
  }

  if (relativeTolerance) {
    simulator.setRelativeTolerance(relativeTolerance);
  }

  return simulator.simulate(startTime, endTime, numPoints);
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

  type Columns = Record<string, number[]>;

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

  const getColumnsFromCsv = (csv: string): Columns => {
    const columns: Columns = {};
    const lines = csv.split("\n");
    const columnNames = [];

    for (const name of lines[0].split(",")) {
      columns[name] = [];
      columnNames.push(name);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      for (let j = 0; j < values.length; j++) {
        columns[columnNames[j]].push(Number(values[j]));
      }
    }

    return columns;
  };

  const getColumnsFromTimeCourseOutput = (output: TimeCourseOutput): Columns => {
    const columns: Columns = {};

    columns["Time"] = output.sliceColumn("time");
    for (const name of output.columnNames) {
      if (name !== "time") {
        columns[name] = output.sliceColumn(name);
      }
    }

    return columns;
  };

  for (const [fileName, code] of Object.entries(simulationFiles)) {
    const modelName = fileName.replace(".ant", "");
    it(`should simulate ${modelName} correctly`, async () => {
      const csv = simulationResults[modelName + ".csv"] as string;
      expect(csv).toBeDefined();

      const params = parseTestParams(code as string);

      const output = await simulate(
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
          output.toCsv(),
        );
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
