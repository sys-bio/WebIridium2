import { createCvodeSimulator, type TimeCourseOutput } from "iridium-simulator";
import { compile } from "../compile/compile";

export type TestParams = {
  startTime: number;
  endTime: number;
  numberOfPoints: number;
  absoluteTolerance: number;
  relativeTolerance: number;
};

export type Columns = Record<string, number[]>;

const paramRegex = /([A-Za-z]+)=([0-9.e+-]+)/g;
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

export const getColumnsFromTimeCourseOutput = (
  output: TimeCourseOutput,
  timeName: string = "Time",
): Columns => {
  const columns: Columns = {};

  columns[timeName] = output.sliceColumn("time");
  for (const name of output.columnNames) {
    if (name !== "time") {
      columns[name] = output.sliceColumn(name);
    }
  }

  return columns;
};

export const simulateOnce = async (
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
