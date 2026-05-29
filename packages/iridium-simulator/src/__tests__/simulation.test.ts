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

  const getColumnsFromArray = (
    spec: ModelSpec,
    numPoints: number,
    array: Float64Array,
  ): Columns => {
    const columns: Columns = {};

    let i = 0;
    const rowLength = spec.y.length + spec.p.length + spec.reactions.length + 1;

    for (const y of spec.y) {
      const column = [];
      for (let j = 0; j < numPoints; j++) {
        column.push(array[j * rowLength + i]);
      }
      columns[y.name] = column;

      i += 1;
    }

    for (const p of spec.p) {
      const column = [];
      for (let j = 0; j < numPoints; j++) {
        column.push(array[j * rowLength + i]);
      }
      columns[p.name] = column;

      i += 1;
    }

    const timeColumn = [];
    for (let j = 0; j < numPoints; j++) {
      timeColumn.push(array[(j + 1) * rowLength - 1]);
    }
    columns["Time"] = timeColumn;

    return columns;
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

      const expectedColumns = getColumnsFromCsv(csv);

      const gotColumns = getColumnsFromArray(
        spec,
        params.numberOfPoints,
        array,
      );

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
