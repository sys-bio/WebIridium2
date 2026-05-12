import "./env.d.ts";

import createBindings from "../build/cvodeBindings.js";
import type { MainModule, Model } from "../build/cvodeBindings.d.ts";
import {
  CORE_NAMESPACE,
  IMPORT_NAMESPACE,
  MEMORY_IMPORT_NAME,
} from "./compile/compile.ts";
import type { ModelSpec } from "./modelSpec.ts";
import { builtinFunctions } from "./compile/builtinImports.ts";
import CvodeBindingsWasmUrl from "../build/cvodeBindings.wasm?url";

const VariableType = {
  floating: 0,
  boundary: 1,
  parameter: 2,
} as const;

type VariableType = typeof VariableType[keyof typeof VariableType];

interface InternalModel {
  spec: ModelSpec;
  variableMapping: Map<string, { type: VariableType; index: number }>;

  /** The model on the C-side. */
  binding: Model;
  rhsFuncPtr: number;
}

export class CvodeWrapper {
  #bindings: MainModule;
  #internalModel: InternalModel | undefined;

  constructor(bindings: MainModule) {
    this.#bindings = bindings;
  }

  getModel(): ModelSpec | undefined {
    return this.#internalModel?.spec;
  }

  async setModel(spec: ModelSpec): Promise<void> {
    this.#disposeCurrentModel();

    const floatingSpeciesVector = new this.#bindings.DoubleVector();
    for (const v of spec.floatingSpecies)
      floatingSpeciesVector.push_back(v.initialValue);

    const boundarySpeciesVector = new this.#bindings.DoubleVector();
    for (const v of spec.boundarySpecies)
      boundarySpeciesVector.push_back(v.initialValue);

    const parametersVector = new this.#bindings.DoubleVector();
    for (const v of spec.parameters) parametersVector.push_back(v.initialValue);

    const instance = await WebAssembly.instantiate(spec.rhsModule, {
      [CORE_NAMESPACE]: {
        // eslint-disable-next-line
        [MEMORY_IMPORT_NAME]: this.#bindings.wasmMemory,
      },
      [IMPORT_NAMESPACE]: Object.fromEntries(
        spec.funcImports.map((name) => [name, builtinFunctions[name].js]),
      ),
    });

    // eslint-disable-next-line
    const funcPtr: number = this.#bindings.addFunction(
      (
        instance.exports as {
          rhs: (
            t: number,
            yPtr: number,
            ydotPtr: number,
            y2Ptr: number,
          ) => void;
        }
      ).rhs,
    );

    const variableMapping = new Map<string, { type: VariableType; index: number }>();
    for (const [i, f] of spec.floatingSpecies.entries()) variableMapping.set(f.name, { type: VariableType.floating, index: i });
    for (const [i, b] of spec.boundarySpecies.entries()) variableMapping.set(b.name, { type: VariableType.boundary, index: i });
    for (const [i, p] of spec.parameters.entries()) variableMapping.set(p.name, { type: VariableType.parameter, index: i });

    this.#internalModel = {
      spec,
      variableMapping,
      binding: new this.#bindings.Model(
        floatingSpeciesVector,
        boundarySpeciesVector,
        parametersVector,
        funcPtr,
      ),
      rhsFuncPtr: funcPtr,
    };

    // ok to delete now since they got copied into the bindings model
    floatingSpeciesVector.delete();
    boundarySpeciesVector.delete();
    parametersVector.delete();
  }

  #disposeCurrentModel(): void {
    if (this.#internalModel) {
      this.#bindings.removeFunction(this.#internalModel.rhsFuncPtr);
      this.#internalModel.binding.delete();
    }
  }

  #checkModel(): InternalModel {
    if (!this.#internalModel) throw new Error("model not loaded");
    return this.#internalModel;
  }

  simulate(
    startTime: number,
    endTime: number,
    numPoints: number,
  ): Float64Array {
    const model = this.#checkModel();

    const array = model.binding.SimulateTimeCourse(
      startTime,
      endTime,
      numPoints,
    );

    // copy
    return array.slice();
  }

  resetAllVariables(): void {
    this.#internalModel?.binding.ResetAllVariables();
  }

  setVariable(name: string, value: number): void {
    if (!this.#internalModel) return;

    const variable = this.#internalModel.variableMapping.get(name);
    if (variable === undefined) return;

    if (variable.type === VariableType.floating) {
      this.#internalModel?.binding.SetFloatingSpecies(variable.index, value);
    } else if (variable.type === VariableType.boundary) {
      this.#internalModel?.binding.SetBoundarySpecies(variable.index, value);
    } else if (variable.type === VariableType.parameter) {
      this.#internalModel?.binding.SetParameter(variable.index, value);
    }
  }
}

export const createCvodeWrapper = async (): Promise<CvodeWrapper> => {
  const locateFile = (name: string, root: string) => {
    const isNode = typeof process === "object" && !process.browser;
    if (name.endsWith(".wasm")) {
      return isNode ? root + "cvodeBindings.wasm" : CvodeBindingsWasmUrl;
    }
    return root + name;
  };

  const bindings = await createBindings({ locateFile });
  return new CvodeWrapper(bindings);
};
