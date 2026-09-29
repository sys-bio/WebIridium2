import { suite, test } from "vitest";
import {
  appendFile,
  mkdir,
  readdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  getColumnsFromCsv,
  getColumnsFromTimeCourseOutput,
  type Columns,
  type TestParams,
} from "../../testingUtils/simTests";
import { buildAntimonyDocument, compileAntimonyDocument } from "../../antimony";
import type { IridiumModel } from "../../ir/model";
import { compile } from "../../compile/compile";
import { createSimulator } from "../../runtime/simulator";
import { compileSbmlString } from "../../sbml/compile";

const WRITE_TEST_OUTPUT = false;
const resultsDir = path.resolve(__dirname, "..", "..", "..", "simResults");
const resultsFile = path.join(resultsDir, "sbml_results.jsonl");

const WIP_TAGS: string[] = [];

const UNSUPPORTED_ANTIMONY_TAGS = [
  "FastReaction",
  "CSymbolDelay",
  "RandomEventExecution",
  "comp:ExternalModelDefinition",
  "fbc",
];

const UNSUPPORTED_SBML_TAGS = [
  "FastReaction",
  "CSymbolDelay",
  "RandomEventExecution",
  "comp:ExternalModelDefinition",
  "fbc",
  "comp",
];

const SKIP_CASES = new Set<number>([
  // These test case create variables with the same names as some constants.
  // libantimony adds an underscore at the end. Expected output expects them
  // without the underscore, so the test runner fails.
  // 1761, 1762, 1763, 1810, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819,
  // 1820, 1821,

  // Antimony doesn't distinguish between constant and boundary species so these algebraic systems become overdetermined (or is $ for boundary??)
  551, 554, 695,

  // Stoichiometry/speciesReference are not marked as const in the conversion
  1386,

  // Why are these ones never terminating? (need to enable HasOnlySubstanceUnits)
  1178,
  1180, 1181,

  // Investigate more (what is going on?)
  1159,
]);

type VersionId =
  | "3.1"
  | "3.2"
  | "2.1"
  | "2.2"
  | "2.3"
  | "2.4"
  | "2.5"
  | "antimony";

const SUPPORTED_VERSIONS_IDS: Set<string> = new Set(["3.2", "antimony"]);

type Case = {
  caseNumber: number;
  tags: string[];
  versions: Partial<Record<VersionId, string>>;
  params: TestParams;
  expectedColumns: Columns;
};

const semanticCasesDir = path.join(__dirname, "semantic");
const cases: Case[] = [];

const parseParams = (settingsText: string): TestParams => {
  const record = Object.fromEntries(
    settingsText.split("\n").map((line) => line.split(":")),
  ) as unknown as Record<string, string>;

  const start = Number(record.start);
  if (Number.isNaN(start)) throw new Error("Invalid start.");

  const duration = Number(record.duration);
  if (Number.isNaN(start)) throw new Error("Invalid duration.");

  const steps = Number(record.steps);
  if (Number.isNaN(steps)) throw new Error("Invalid steps.");

  const absolute = Number(record.absolute);
  if (Number.isNaN(absolute)) throw new Error("Invalid absolute.");

  const relative = Number(record.relative);
  if (Number.isNaN(relative)) throw new Error("Invalid relative.");

  return {
    startTime: start,
    endTime: start + duration,
    numberOfPoints: steps,
    absoluteTolerance: absolute,
    relativeTolerance: relative,
    amounts: record.amount
      .split(",")
      .map((s) => s.trim())
      .filter((t) => t),
  };
};

const parseTags = (modelMText: string): string[] => {
  const tags: string[] = [];

  const componentTags = modelMText.match(/componentTags: +(.+)$/m);
  if (componentTags !== null) {
    tags.push(...componentTags[1].split(",").map((t) => t.trim()));
  }

  const testTags = modelMText.match(/testTags: +(.+)$/m);
  if (testTags !== null) {
    tags.push(...testTags[1].split(",").map((t) => t.trim()));
  }

  const testType = modelMText.match(/testType: +(.+)$/m);
  if (testType !== null) {
    tags.push(testType[1].trim());
  }

  const packagesPresent = modelMText.match(/packagesPresent: +(.+)$/m);
  if (packagesPresent !== null) {
    tags.push(...packagesPresent[1].split(",").map((t) => t.trim()));
  }

  return tags;
};

for (const dirName of await readdir(semanticCasesDir)) {
  const caseNumber = Number(dirName);
  if (Number.isNaN(caseNumber)) {
    throw new Error(
      "Unexpected directory in semantic cases. All directory names should be a number: " +
        dirName,
    );
  }

  const casePath = path.join(semanticCasesDir, dirName);
  try {
    let tags: string[] | undefined;
    const versions: Partial<Record<VersionId, string>> = {};
    let params: TestParams | undefined;
    let expectedColumns: Columns | undefined;
    for (const fileName of await readdir(casePath)) {
      const filePath = path.join(casePath, fileName);
      if (fileName.endsWith("-settings.txt")) {
        const settingsText = await readFile(filePath, "utf8");
        params = parseParams(settingsText);
      } else if (fileName.endsWith("-model.m")) {
        const modelMText = await readFile(filePath, "utf-8");
        tags = parseTags(modelMText);
      } else if (fileName.endsWith(".xml")) {
        const match = fileName.match(/-sbml-l(\d)v(\d)/);
        if (match) {
          const id = match[1] + "." + match[2];
          if (SUPPORTED_VERSIONS_IDS.has(id)) {
            versions[id as VersionId] = await readFile(filePath, "utf-8");
          }
        }
      } else if (fileName.endsWith(".ant")) {
        versions.antimony = await readFile(filePath, "utf-8");
      } else if (fileName.endsWith(".csv")) {
        expectedColumns = getColumnsFromCsv(await readFile(filePath, "utf-8"));
      }
    }

    if (!tags) {
      throw new Error("Missing tags.");
    }

    if (!params) {
      throw new Error("Missing params");
    }

    if (!expectedColumns) {
      throw new Error("Missing expectedColumns");
    }

    cases.push({ caseNumber, tags, versions, params, expectedColumns });
  } catch (err) {
    if (err instanceof Error) {
      err.message = `case ${caseNumber} error: ` + err.message;
    }

    throw err;
  }
}

cases.sort((a, b) => a.caseNumber - b.caseNumber);

const simulator = await createSimulator();

const isAntimonySupported = (caseNumber: number, tags: string[]): boolean =>
  !UNSUPPORTED_ANTIMONY_TAGS.some((t) => tags.includes(t)) &&
  !SKIP_CASES.has(caseNumber);

const isSbmlSupported = (caseNumber: number, tags: string[]): boolean =>
  !UNSUPPORTED_SBML_TAGS.some((t) => tags.includes(t)) &&
  !SKIP_CASES.has(caseNumber);

const getColumn = (columns: Columns, name: string): number[] => {
  if (name === "Time" || name === "time") {
    return columns["Time"] ?? columns["Time_"];
  }

  // A__S1 -> A_S1
  // avogadro -> avogadro_
  return (
    columns[name] ?? columns[name.replaceAll("__", "_")] ?? columns[name + "_"]
  );
};

const runCase = async (
  ir: IridiumModel,
  params: TestParams,
  expectedColumns: Columns,
  caseNumber?: number,
): Promise<void> => {
  let passed = true;
  let error: unknown;

  try {
    const model = await compile(ir);
    await simulator.setModel(model);
    simulator.setAbsoluteTolerance(1e-8);
    simulator.setRelativeTolerance(1e-10);

    const output = simulator.simulate(
      params.startTime,
      params.endTime,
      params.numberOfPoints + 1,
    );

    for (const name of params.amounts) {
      const variable = ir.variables.find((v) => v.name === name);
      if (!variable) throw new Error(`Can't find variable: ${name}.`);
      // not sure if this condition is ever false...
      if (variable.hasSubstanceOnly) continue;

      const compartment = ir.compartments.find((c) =>
        c.containedVariables.includes(name),
      );
      if (!compartment) continue;

      const variableIndex = output.getColumnIndex(variable.name);
      const compartmentIndex = output.getColumnIndex(
        compartment.containerVariable,
      );

      for (let i = 0; i < output.rowCount; i++) {
        output.buffer[variableIndex + i * output.columnCount] *=
          output.buffer[compartmentIndex + i * output.columnCount];
      }
    }

    const gotColumns = getColumnsFromTimeCourseOutput(output);

    for (const [name, column] of Object.entries(expectedColumns)) {
      for (let i = 0; i < column.length; i++) {
        const column = getColumn(gotColumns, name);
        const got = column[i];
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
  } catch (err) {
    passed = false;
    error = err;
  }

  if (caseNumber !== undefined) {
    await appendResult({
      number: caseNumber,
      pass: passed ? "pass" : "fail",
      error: error instanceof Error ? error.message : "unknown",
      timestamp: new Date().toISOString(),
    });
  }

  if (error) {
    // eslint-disable-next-line
    throw error;
  }
};

const sbmlVersionSuite = (id: VersionId) => {
  suite("sbml " + id, () => {
    for (const {
      caseNumber,
      params,
      versions,
      tags,
      expectedColumns,
    } of cases) {
      const sbml = versions[id];
      test.skipIf(!isSbmlSupported(caseNumber, tags) || !sbml)(
        `${caseNumber} (${tags.join(", ")})`,
        async () => {
          const ir = compileSbmlString(sbml!);
          await runCase(ir, params, expectedColumns);
        },
      );
    }
  });
};

if (WRITE_TEST_OUTPUT) {
  console.log(`Writing to ${resultsDir}`);
}

if (WRITE_TEST_OUTPUT) {
  await mkdir(resultsDir, { recursive: true });
  await writeFile(resultsFile, "");
}

const appendResult = async (obj: unknown) => {
  if (!WRITE_TEST_OUTPUT) return;
  try {
    await appendFile(resultsFile, JSON.stringify(obj) + "\n");
  } catch (e) {
    // Don't fail tests just because logging failed
    console.error("Failed to write test result:", e);
  }
};
suite("antimony", async () => {
  for (const { caseNumber, params, versions, tags, expectedColumns } of cases) {
    const antimony = versions.antimony;
    const skipping = !isAntimonySupported(caseNumber, tags) || !antimony;
    if (skipping && WRITE_TEST_OUTPUT) {
      await appendResult({
        number: caseNumber,
        pass: WIP_TAGS.some((t) => tags.includes(t)) ? "wip" : "skip",
        timestamp: new Date().toISOString(),
      });
    }
    test.skipIf(skipping)(`${caseNumber} (${tags.join(", ")})`, async () => {
      const document = buildAntimonyDocument(antimony!);
      const ir = compileAntimonyDocument(document);
      await runCase(
        ir,
        params,
        expectedColumns,
        WRITE_TEST_OUTPUT ? caseNumber : undefined,
      );
    });
  }
});

sbmlVersionSuite("3.2");
