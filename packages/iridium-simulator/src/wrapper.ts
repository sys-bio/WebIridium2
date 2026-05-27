import "./env.d.ts";

import createBindings from "../build/cvodeBindings.js";
import type {
  EventInfoVector,
  EventParams,
  IntVector,
  MainModule,
  Model,
} from "../build/cvodeBindings.d.ts";
import {
  CHECK_EVENTS_NAME,
  CORE_NAMESPACE,
  IMPORT_NAMESPACE,
  MEMORY_IMPORT_NAME,
  RHS_NAME,
  ROOTS_NAME,
} from "./names.ts";
import type { ModelSpec } from "./modelSpec.ts";
import {
  builtinFunctions,
  type ImportedFunction,
} from "./compile/functions.ts";
import CvodeBindingsWasmUrl from "../build/cvodeBindings.wasm?url";
import { IndexSymbolTable } from "./compile/SymbolTable.ts";

interface InternalModel {
  spec: ModelSpec;
  yIndices: IndexSymbolTable;
  pIndices: IndexSymbolTable;

  /** The model on the C-side. */
  binding: Model;

  /** Pointers to clean up later. */
  funcPtrs: number[];
}

export class CvodeWrapper {
  #bindings: MainModule;
  #internalModel: InternalModel | undefined;

  #absoluteTolerance: number = 1e-12;
  #relativeTolerance: number = 1e-6;

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
    for (const y of spec.y) {
      yIndices.add(y.name);
      yVector.push_back(y.initialValue ?? 0);
    }

    const pIndices = new IndexSymbolTable();
    const pVector = new this.#bindings.DoubleVector();
    for (const p of spec.p) {
      pIndices.add(p.name);
      pVector.push_back(p.initialValue ?? 0);
    }

    const instance = await WebAssembly.instantiate(spec.wasmModule, {
      [CORE_NAMESPACE]: {
        // eslint-disable-next-line
        [MEMORY_IMPORT_NAME]: this.#bindings.wasmMemory,
      },
      [IMPORT_NAMESPACE]: Object.fromEntries(
        spec.funcImports.map((name) => [
          name,
          (builtinFunctions[name] as ImportedFunction).js,
        ]),
      ),
    });

    const funcPtrs: number[] = [];
    const vectorsToDestroy: (IntVector | EventInfoVector)[] = [];

    const rhsPtr = this.#bindings.addFunction(
      instance.exports[RHS_NAME],
    ) as number;

    let eventParams: EventParams | undefined;

    funcPtrs.push(rhsPtr);

    if (spec.events.length > 0) {
      const rootsPtr = this.#bindings.addFunction(
        instance.exports[ROOTS_NAME],
      ) as number;
      const checkEventsPtr = this.#bindings.addFunction(
        instance.exports[CHECK_EVENTS_NAME],
      ) as number;
      const eventInfo = new this.#bindings.EventInfoVector();

      for (const event of spec.events) {
        const getAssignmentsPtr = this.#bindings.addFunction(
          instance.exports[event.getAssignmentsExport],
        ) as number;
        const getDelayPtr = this.#bindings.addFunction(
          instance.exports[event.getDelayExport],
        ) as number;

        const yIndices = new this.#bindings.IntVector();
        for (const index of event.yIndices.values()) {
          yIndices.push_back(index);
        }

        const pIndices = new this.#bindings.IntVector();
        for (const index of event.pIndices.values()) {
          pIndices.push_back(index);
        }

        eventInfo.push_back({
          num_roots: event.countRoots,
          y_indices: yIndices,
          p_indices: pIndices,
          get_assignments_fn: getAssignmentsPtr,
          get_delay_fn: getDelayPtr,
          is_from_trigger: false,
          is_persistent: false,
          is_t0: false,
          priority: 0,
        });

        funcPtrs.push(getAssignmentsPtr);
        funcPtrs.push(getDelayPtr);

        vectorsToDestroy.push(yIndices);
        vectorsToDestroy.push(pIndices);
      }

      eventParams = {
        event_info: eventInfo,
        roots_fn: rootsPtr,
        check_events_fn: checkEventsPtr,
      };

      vectorsToDestroy.push(eventInfo);
    }

    this.#internalModel = {
      spec,
      yIndices,
      pIndices,
      binding: new this.#bindings.Model(
        yVector,
        pVector,
        spec.reactions.length,
        rhsPtr,
        eventParams,
      ),
      funcPtrs,
    };

    this.#updateBindingSettings();

    // ok to delete now since they got copied into the bindings model
    yVector.delete();
    pVector.delete();
    for (const vector of vectorsToDestroy) {
      vector.delete();
    }
  }

  #disposeCurrentModel(): void {
    if (this.#internalModel) {
      for (const ptr of this.#internalModel.funcPtrs) {
        this.#bindings.removeFunction(ptr);
      }
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

  #updateBindingSettings(): void {
    if (this.#internalModel) {
      this.#internalModel.binding.SetAbsoluteTolerance(this.#absoluteTolerance);
      this.#internalModel.binding.SetRelativeTolerance(this.#relativeTolerance);
    }
  }

  setAbsoluteTolerance(value: number): void {
    this.#absoluteTolerance = value;
    this.#updateBindingSettings();
  }

  setRelativeTolerance(value: number): void {
    this.#relativeTolerance = value;
    this.#updateBindingSettings();
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
