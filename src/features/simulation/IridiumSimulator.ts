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
import {
  TIME_NAME,
  TimeCourseOutput,
  type RuntimeModel,
} from "iridium-simulator";
import {
  type AntimonyModel,
  type AntimonyVariable,
} from "antimony-language/semantic";
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
      runtimeModel: RuntimeModel;
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

  getVariablesFromAntimonyModel(
    model: AntimonyModel,
    runtimeModel: RuntimeModel,
  ): Variable[] {
    const variables: Variable[] = [];

    const getVariableCategory = (v: AntimonyVariable): string => {
      if (v.variableKind === "compartment") {
        return "Compartments";
      } else if (v.variableKind === "parameter") {
        if (v?.assignment?.kind === "rate") {
          return "ODEs";
        } else {
          return "Parameters";
        }
      } else if (v.variableKind === "species") {
        if (v.isConst) {
          return "Boundary Species";
        } else {
          return "Floating Species";
        }
      } else {
        return "Unknown";
      }
    };

    variables.push({
      type: "normal",
      defaultDisplayName: TIME_NAME,
      name: TIME_NAME,
      category: "Time",
    });

    for (const runtimeVariable of [...runtimeModel.y, ...runtimeModel.p]) {
      const object = model.objects.get(runtimeVariable.name)!;
      if (object.kind === "variable") {
        if (object?.assignment?.kind !== "rule") {
          variables.push({
            type: "settable",
            setName: object.name,
            defaultValue: runtimeVariable.initialValue,
            defaultDisplayName: object.name,
            name: object.name,
            category: getVariableCategory(object),
          });
        } else {
          variables.push({
            type: "normal",
            defaultDisplayName: object.name,
            name: object.name,
            category: getVariableCategory(object),
          });
        }
      }
    }

    for (const reactionName of runtimeModel.reactions) {
      variables.push({
        type: "normal",
        defaultDisplayName: reactionName,
        name: reactionName,
        category: "Reaction Rates",
      });
    }

    return variables;
  }

  async #compile(
    code: string,
    abortSignal?: AbortSignal,
  ): Promise<{ runtimeModel: RuntimeModel; variables: Variable[] }> {
    if (this.#compiledModel?.code === code) {
      return await this.#compiledModel.promise;
    } else {
      const modelPromise = this.#workerPool.runTask<
        IridiumCompileAction,
        IridiumCompileResult
      >("compile", code, undefined, abortSignal);

      this.#compiledModel = {
        code: code,
        promise: modelPromise.then(({ antimonyModel, runtimeModel }) => ({
          runtimeModel,
          variables: this.getVariablesFromAntimonyModel(
            antimonyModel,
            runtimeModel,
          ),
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
    const { runtimeModel } = await this.#compile(antimonyCode);
    const array = await this.#workerPool.runTask<
      IridiumTimeCourseAction,
      IridiumTimeCourseResult
    >("timeCourse", options, runtimeModel, abortSignal);

    // NOTE: this transformation is temporary until we update all simulators to use Flat64Array
    const columns = [];

    const output = new TimeCourseOutput(runtimeModel, array);
    const titles = [
      ...runtimeModel.y.map((v) => v.name),
      ...runtimeModel.p.map((v) => v.name),
      ...runtimeModel.reactions,
      TIME_NAME,
    ];

    for (const title of titles) {
      columns.push({
        title,
        values: output.sliceColumn(title),
      });
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
