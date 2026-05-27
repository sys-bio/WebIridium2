import { createWorker } from "../workers";
import { WorkerPool } from "../taskPool";
import {
  Simulator,
  type SimulatorCapabilities,
  type TimeCourseResult,
  type Variable,
  type SimulateTimeCourseOptions,
  type ComputeSteadyStateOptions,
  type SteadyStateResult,
} from "./Simulator";
import { TIME_NAME, type ModelSpec } from "iridium-simulator";
import type {
  IridiumCompileAction,
  IridiumCompileResult,
  IridiumTimeCourseAction,
  IridiumTimeCourseResult,
} from "@/workers/IridiumSimulatorWorker";
import type { VariableSpec } from "iridium-simulator/src/modelSpec";

const categoryNamesFromVariableKind = {
  floating: "Floating Species",
  boundary: "Boundary Species",
  compartment: "Compartment",
} as const;

/** Adapter for the custom packages/iridium-simulator. */
export class IridiumSimulator extends Simulator {
  defaultIndependentVariableName: string = TIME_NAME;
  scanIndependentVariableName: string = TIME_NAME;
  capabilities: SimulatorCapabilities = {
    canRunSteadyState: false,
  };

  #compiledModel?: {
    code: string;
    promise: Promise<{
      spec: ModelSpec;
      variables: Variable[];
    }>;
  };

  #workerPool: WorkerPool;

  constructor() {
    super();
    this.#workerPool = new WorkerPool(() => createWorker("iridiumSimulator"), {
      maxWorkers: navigator.hardwareConcurrency,
    });
  }

  getVariablesFromSpec(spec: ModelSpec): Variable[] {
    const variables: Variable[] = [];

    variables.push({
      type: "normal",
      defaultDisplayName: TIME_NAME,
      name: TIME_NAME,
      category: "Time",
    });

    const getVariableCategory = (
      v: VariableSpec,
      parameterName: string,
    ): string => {
      if (v.kind === "parameter") {
        return parameterName;
      } else {
        return categoryNamesFromVariableKind[v.kind];
      }
    };

    for (const yVar of spec.y) {
      if (yVar.initialValue) {
        variables.push({
          type: "settable",
          defaultDisplayName: yVar.name,
          name: yVar.name,
          category: getVariableCategory(yVar, "ODEs"),
          setName: yVar.name,
          defaultValue: yVar.initialValue,
        });
      } else {
        variables.push({
          type: "normal",
          defaultDisplayName: yVar.name,
          name: yVar.name,
          category: getVariableCategory(yVar, "ODEs"),
        });
      }
    }

    for (const pVar of spec.p) {
      if (pVar.initialValue) {
        variables.push({
          type: "settable",
          defaultDisplayName: pVar.name,
          name: pVar.name,
          category: getVariableCategory(pVar, "Parameters"),
          setName: pVar.name,
          defaultValue: pVar.initialValue,
        });
      } else {
        variables.push({
          type: "normal",
          defaultDisplayName: pVar.name,
          name: pVar.name,
          category: getVariableCategory(pVar, "Parameters"),
        });
      }
    }

    for (const reaction of spec.reactions) {
      variables.push({
        type: "normal",
        defaultDisplayName: reaction,
        name: reaction,
        category: "Reaction Rates",
      });
    }

    return variables;
  }

  async #compile(
    code: string,
    abortSignal?: AbortSignal,
  ): Promise<{ spec: ModelSpec; variables: Variable[] }> {
    if (this.#compiledModel?.code === code) {
      return await this.#compiledModel.promise;
    } else {
      const specPromise = this.#workerPool.runTask<
        IridiumCompileAction,
        IridiumCompileResult
      >("compile", code, undefined, abortSignal);

      this.#compiledModel = {
        code: code,
        promise: specPromise.then((spec) => ({
          spec: spec,
          variables: this.getVariablesFromSpec(spec),
        })),
      };

      return await this.#compiledModel.promise;
    }
  }

  async loadModel(
    antimonyCode: string,
    abortSignal?: AbortSignal,
  ): Promise<Variable[]> {
    return (await this.#compile(antimonyCode, abortSignal)).variables;
  }

  async simulateTimeCourse(
    antimonyCode: string,
    options: SimulateTimeCourseOptions,
    abortSignal?: AbortSignal,
  ): Promise<TimeCourseResult> {
    const { spec } = await this.#compile(antimonyCode);
    const array = await this.#workerPool.runTask<
      IridiumTimeCourseAction,
      IridiumTimeCourseResult
    >("timeCourse", options, spec, abortSignal);

    // NOTE: this transformation is temporary until we update all simulators to use Flat64Array
    const columns = [];
    const rows = options.parameters.numberOfPoints;
    let col = 0;

    const titles = [
      ...spec.y.map((v) => v.name),
      ...spec.p.map((v) => v.name),
      ...spec.reactions,
      TIME_NAME,
    ];

    for (const title of titles) {
      const values: number[] = [];
      const column = { title, values };

      for (let i = 0; i < rows; i++) {
        column.values[i] = array[col + i * titles.length];
      }

      columns.push(column);

      col += 1;
    }

    return {
      type: "timeCourse",
      columns: columns,
    };
  }

  computeSteadyState(
    _antimonyCode: string,
    _options: ComputeSteadyStateOptions,
    _abortSignal?: AbortSignal,
  ): Promise<SteadyStateResult> {
    throw new Error("Not implemented.");
  }
}
