import { expect, it } from "vitest";
import {
  getColumnsFromCsv,
  getColumnsFromTimeCourseOutput,
  parseTags,
  parseTestParams,
  simulateOnce,
} from "./testUtil.ts";
import { promises as fs } from "fs";
import path from "path";

// Turn this on then you can use plotCompare.py script to compare the results with expected.
const WRITE_TEST_OUTPUT = true;
const resultsDir = path.resolve(__dirname, "..", "..", "simResults");

if (WRITE_TEST_OUTPUT) {
  console.log(`Writing to ${resultsDir}`);
}

const simulationFiles = import.meta.glob("./sbmlTestSuite/*.ant", {
  query: "?raw",
  import: "default",
  eager: true,
});

const simulationResults = import.meta.glob("./sbmlTestSuite/*.csv", {
  query: "?raw",
  import: "default",
  eager: true,
});

for (const [fileName, code] of Object.entries(simulationFiles)) {
  const modelName = fileName.replace(".ant", "");
  const tags = parseTags(code as string);

  it(`${modelName} (${tags.join(", ")})`, async () => {
    const csv = simulationResults[modelName + ".csv"] as string;
    expect(csv).toBeDefined();

    const params = parseTestParams(code as string);

    const output = await simulateOnce(
      code as string,
      params.startTime,
      params.endTime,
      params.numberOfPoints + 1,
      1e-12,
      1e-16,
    );

    const expectedColumns = getColumnsFromCsv(csv);

    const gotColumns = getColumnsFromTimeCourseOutput(output, "time");

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
        if (
          Math.abs(expected - got) >
          params.absoluteTolerance +
            params.relativeTolerance * Math.abs(expected)
        ) {
          throw new Error(
            `${name} too far apart at index ${i}. Expected ${expected}, got ${got}, diff ${expected - got}.`,
          );
        }
      }
    }
  });
}
