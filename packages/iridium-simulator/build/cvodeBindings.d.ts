// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    /** @param {string=} sig */
    function addFunction(func: any, sig?: string | undefined): any;
    function removeFunction(index: any): void;
    let wasmMemory: any;
}
interface WasmModule {
}

export interface ClassHandle {
  isAliasOf(other: ClassHandle): boolean;
  delete(): void;
  deleteLater(): this;
  isDeleted(): boolean;
  // @ts-ignore - If targeting lower than ESNext, this symbol might not exist.
  [Symbol.dispose](): void;
  clone(): this;
}
export interface Model extends ClassHandle {
  num_variables(): number;
  ResetState(): void;
  SetYValue(_0: number, _1: number): void;
  SetPValue(_0: number, _1: number): void;
  SetAbsoluteTolerance(_0: number): void;
  SetRelativeTolerance(_0: number): void;
  SimulateTimeCourse(_0: number, _1: number, _2: number): Float64Array;
}

export interface DoubleVector extends ClassHandle, Iterable<number> {
  push_back(_0: number): void;
  resize(_0: number, _1: number): void;
  size(): number;
  get(_0: number): number | undefined;
  set(_0: number, _1: number): boolean;
}

export interface IntVector extends ClassHandle, Iterable<number> {
  push_back(_0: number): void;
  resize(_0: number, _1: number): void;
  size(): number;
  get(_0: number): number | undefined;
  set(_0: number, _1: number): boolean;
}

export type EventInfo = {
  is_for_piecewise: boolean,
  is_persistent: boolean,
  is_t0: boolean,
  is_from_trigger: boolean,
  num_roots: number,
  y_indices: IntVector,
  p_indices: IntVector,
  get_priority_fn: number,
  get_delay_fn: number,
  get_assignments_fn: number
};

export interface EventInfoVector extends ClassHandle, Iterable<EventInfo> {
  push_back(_0: EventInfo): void;
  resize(_0: number, _1: EventInfo): void;
  size(): number;
  get(_0: number): EventInfo | undefined;
  set(_0: number, _1: EventInfo): boolean;
}

export type EventParams = {
  event_info: EventInfoVector,
  roots_fn: number,
  check_roots_fn: number,
  update_conditions_fn: number
};

interface EmbindModule {
  Model: {
    new(_0: DoubleVector, _1: DoubleVector, _2: number, _3: number, _4?: EventParams): Model;
  };
  DoubleVector: {
    new(): DoubleVector;
  };
  IntVector: {
    new(): IntVector;
  };
  EventInfoVector: {
    new(): EventInfoVector;
  };
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
