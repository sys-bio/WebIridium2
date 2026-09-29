import type { TimeCourseOutput } from "../runtime/output";

export type TestParams = {
  startTime: number;
  endTime: number;
  numberOfPoints: number;
  absoluteTolerance: number;
  relativeTolerance: number;
  amounts: string[];
};

export type Columns = Record<string, number[]>;

const paramRegex = /([A-Za-z]+)=([^\s]+)/g;
export const parseTestParams = (code: string): TestParams => {
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
    amounts: (params["amounts"] ?? "").split(",").filter((v) => v.trim()),
  };
};

export const parseTags = (code: string): string[] => {
  const lines = code.split("\n");
  if (lines[1]?.startsWith("## tags=")) {
    return lines[1].substring(8).split(",");
  }
  return [];
};

export const getColumnsFromCsv = (csv: string): Columns => {
  const columns: Columns = {};
  const lines = csv.split("\n");
  const columnNames = [];

  for (let name of lines[0].split(",")) {
    name = name.trim();
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

export const getColumnsFromTimeCourseOutput = (
  output: TimeCourseOutput,
): Columns => {
  const columns: Columns = {};

  columns["Time"] = output.sliceColumn("time");
  for (const name of output.columnNames) {
    if (name !== "time") {
      columns[name] = output.sliceColumn(name);
    }
  }

  return columns;
};
