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
      defaultDisplayName: "Time",
      name: TIME_NAME,
      category: "Time",
    });

    for (const f of spec.floatingSpecies) {
      variables.push({
        type: "settable",
        defaultDisplayName: f.name,
        name: f.name,
        category: "Floating Species",
        setName: f.name,
        defaultValue: f.initialValue,
      });
    }

    for (const b of spec.boundarySpecies) {
      variables.push({
        type: "settable",
        defaultDisplayName: b.name,
        name: b.name,
        category: "Boundary Species",
        setName: b.name,
        defaultValue: b.initialValue,
      });
    }

    for (const p of spec.parameters) {
      variables.push({
        type: "settable",
        defaultDisplayName: p.name,
        name: p.name,
        category: "Parameter",
        setName: p.name,
        defaultValue: p.initialValue,
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
      ...spec.floatingSpecies.map((v) => v.name),
      ...spec.boundarySpecies.map((v) => v.name),
      ...spec.parameters.map((v) => v.name),
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
