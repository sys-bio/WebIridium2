import "./env.d.ts";

import createBindings from "../build/cvodeBindings.js";
import type { MainModule, Model } from "../build/cvodeBindings.d.ts";
import {
  CORE_NAMESPACE,
  IMPORT_NAMESPACE,
  MEMORY_IMPORT_NAME,
  RHS_NAME,
} from "./names.ts";
import type { ModelSpec } from "./modelSpec.ts";
import { builtinFunctions } from "./compile/builtinImports.ts";
import CvodeBindingsWasmUrl from "../build/cvodeBindings.wasm?url";
import { IndexSymbolTable } from "./compile/SymbolTable.ts";

interface InternalModel {
  spec: ModelSpec;
  yIndices: IndexSymbolTable;
  pIndices: IndexSymbolTable;

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

    const yIndices = new IndexSymbolTable();
    const yVector = new this.#bindings.DoubleVector();
    for (const v of spec.floatingSpecies) {
      yIndices.add(v.name);
      yVector.push_back(v.initialValue);
    }
    for (const v of spec.odes) {
      yIndices.add(v.name);
      yVector.push_back(v.initialValue);
    }

    const pIndices = new IndexSymbolTable();
    const pVector = new this.#bindings.DoubleVector();
    for (const b of spec.boundarySpecies) {
      pIndices.add(b.name);
      pVector.push_back(b.initialValue);
    }
    for (const p of spec.parameters) {
      pIndices.add(p.name);
      pVector.push_back(p.initialValue);
    }

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
          [RHS_NAME]: (
            t: number,
            yPtr: number,
            ydotPtr: number,
            y2Ptr: number,
          ) => void;
        }
      )[RHS_NAME],
    );

    this.#internalModel = {
      spec,
      yIndices,
      pIndices,
      binding: new this.#bindings.Model(
        yVector,
        pVector,
        spec.reactions.length,
        funcPtr,
      ),
      rhsFuncPtr: funcPtr,
    };

    // ok to delete now since they got copied into the bindings model
    yVector.delete();
    pVector.delete();
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

    if (this.#internalModel.yIndices.has(name)) {
      this.#internalModel.binding.SetYValue(
        this.#internalModel.yIndices.get(name),
        value,
      );
    } else {
      this.#internalModel.binding.SetPValue(
        this.#internalModel.pIndices.get(name),
        value,
      );
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
