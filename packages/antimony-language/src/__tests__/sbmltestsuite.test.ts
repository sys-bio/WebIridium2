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

const UNSUPPORTED_TAGS = [
  "AlgebraicRule",
  "FastReaction",
  "CSymbolDelay",
  "RandomEventExecution",
  "comp:ExternalModelDefinition",

  // NEED TO TEST SEPARATELY (not fully converted by libantimony)
  "ConversionFactors",
  "HasOnlySubstanceUnits",
  "NoMathML",
];
const WIP_TAGS = ["CSymbolRateOf"];
const SKIP_CASES = new Set<number>([
  // These test case create variables with the same names as some constants.
  // libantimony adds an underscore at the end. Expected output expects them
  // without the underscore, so the test runner fails.
  1761, 1762, 1763, 1810, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819,
  1820, 1821,

  // These ones are converted incorrectly since libantimony seems to not handle
  // passing constants as parameters to user-defined functions correctly (?)
  1486, 1490, 1491,

  // This one doesn't convert the rate rule deletion.
  1149,

  // The Antimony converter doesn't express a deleted submodel parameter with a rate rule properly.
  1162,
]);

// Turn this on then you can use plotCompare.py script to compare the results with expected.
const WRITE_TEST_OUTPUT = true;
const resultsDir = path.resolve(__dirname, "..", "..", "simResults");
const RESULTS_FILE = path.join(resultsDir, "sbml_results.jsonl");

if (WRITE_TEST_OUTPUT) {
  console.log(`Writing to ${resultsDir}`);
}

if (WRITE_TEST_OUTPUT) {
  await fs.mkdir(resultsDir, { recursive: true });
  await fs.writeFile(RESULTS_FILE, "");
}

const appendResult = async (obj: unknown) => {
  if (!WRITE_TEST_OUTPUT) return;
  try {
    await fs.appendFile(RESULTS_FILE, JSON.stringify(obj) + "\n");
  } catch (e) {
    // Don't fail tests just because logging failed
    console.error("Failed to write test result:", e);
  }
};

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
  const modelNumber = parseInt(modelName.match(/\d+/)![0]);
  const tags = parseTags(code as string);
  if (
    UNSUPPORTED_TAGS.some((t) => tags.includes(t)) ||
    WIP_TAGS.some((t) => tags.includes(t)) ||
    SKIP_CASES.has(modelNumber)
  ) {
    await appendResult({
      number: modelNumber,
      pass: WIP_TAGS.some((t) => tags.includes(t)) ? "wip" : "skip",
      timestamp: new Date().toISOString(),
    });
    continue;
  }

  it(`${modelName} (${tags.join(", ")})`, async () => {
    // Run simulation and checks inside try/catch so we can log pass/fail
    let passed = true;
    let error: unknown;

    try {
      const csv = simulationResults[modelName + ".csv"] as string;
      expect(csv).toBeDefined();

      const params = parseTestParams(code as string);

      const output = await simulateOnce(
        code as string,
        params.startTime,
        params.endTime,
        params.numberOfPoints + 1,
        1e-8,
        1e-10,
        params.amounts,
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
          // for whatever reason, some of the cases have their output with Time, others as time.
          const got = gotColumns[name === "time" ? "Time" : name][i];
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
    } catch (e: unknown) {
      passed = false;
      error = e;
    }

    // append result (do this after checks so results file is updated even on failure)
    await appendResult({
      number: modelNumber,
      pass: passed ? "pass" : "fail",
      error: error instanceof Error ? error.message : "unknown",
      timestamp: new Date().toISOString(),
    });

    // rethrow the error so test framework still reports failures
    if (!passed) {
      throw error;
    }
  });
}
