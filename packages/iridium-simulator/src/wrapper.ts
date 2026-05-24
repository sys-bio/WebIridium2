import "./env.d.ts";

import createBindings from "../build/cvodeBindings.js";
import type {
  EventParams,
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
import { builtinFunctions } from "./compile/builtinImports.ts";
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

    const instance = await WebAssembly.instantiate(spec.wasmModule, {
      [CORE_NAMESPACE]: {
        // eslint-disable-next-line
        [MEMORY_IMPORT_NAME]: this.#bindings.wasmMemory,
      },
      [IMPORT_NAMESPACE]: Object.fromEntries(
        spec.funcImports.map((name) => [name, builtinFunctions[name].js]),
      ),
    });

    const funcPtrs: number[] = [];

    const rhsPtr = this.#bindings.addFunction(instance.exports[RHS_NAME]) as number;

    let eventParams: EventParams | undefined;

    funcPtrs.push(rhsPtr);

    if (spec.events.length > 0) {
      const rootsPtr = this.#bindings.addFunction(instance.exports[ROOTS_NAME]) as number;
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
      }

      eventParams = {
        event_info: eventInfo,
        roots_fn: rootsPtr,
        check_events_fn: checkEventsPtr,
      };
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

    // ok to delete now since they got copied into the bindings model
    yVector.delete();
    pVector.delete();
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
