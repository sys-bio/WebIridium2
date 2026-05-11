import createBindings from "../build/cvodeBindings.js";
import type { MainModule, Model } from "../build/cvodeBindings.d.ts";
import { IMPORT_NAMESPACE, MEMORY_IMPORT_NAME } from "./compile/compile.ts";
import type { ModelSpec } from "./modelSpec.ts";
// import CvodeBindingsWasmUrl from "../build/cvodeBindings.wasm?url";

interface InternalModel {
  spec: ModelSpec;

  /** The model on the C-side. */
  binding: Model;
  rhsFuncPtr: number;
}

class Wrapper {
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
      [IMPORT_NAMESPACE]: {
        // eslint-disable-next-line
        [MEMORY_IMPORT_NAME]: this.#bindings.wasmMemory,
      },
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

    this.#internalModel = {
      spec,
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

  resultToString(result: Float64Array): string {
    const model = this.#checkModel();

    const builder: string[] = [];

    for (const floating of model.spec.floatingSpecies) {
      builder.push(floating.name);
      builder.push(",");
    }

    for (const boundary of model.spec.boundarySpecies) {
      builder.push(boundary.name);
      builder.push(",");
    }

    for (const parameter of model.spec.parameters) {
      builder.push(parameter.name);
      builder.push(",");
    }

    builder.push("Time\n");

    const cols = model.binding.num_variables();

    for (let i = 0; i < result.length; i++) {
      builder.push(result[i].toString());

      if (i < result.length - 1) {
        if ((i + 1) % cols === 0) {
          builder.push("\n");
        } else {
          builder.push(",");
        }
      }
    }

    return builder.join("");
  }
}

export const createWrapper = async (): Promise<Wrapper> => {
  const locateFile = (name: string, root: string) => {
    console.log("root:", root);
    const isNode = typeof process === "object" && !process.browser;
    if (name.endsWith(".wasm")) {
      return isNode ? root + "cvodeBindings.wasm" : "stub"; // CvodeBindingsWasmUrl;
    }
    return root + name;
  };

  const bindings = await createBindings({ locateFile });
  return new Wrapper(bindings);
};
