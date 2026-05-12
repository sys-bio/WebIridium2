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
export interface DoubleVector extends ClassHandle, Iterable<number> {
  push_back(_0: number): void;
  resize(_0: number, _1: number): void;
  size(): number;
  get(_0: number): number | undefined;
  set(_0: number, _1: number): boolean;
}

export interface Model extends ClassHandle {
  num_variables(): number;
  ResetAllVariables(): void;
  SetFloatingSpecies(_0: number, _1: number): void;
  SetBoundarySpecies(_0: number, _1: number): void;
  SetParameter(_0: number, _1: number): void;
  SimulateTimeCourse(_0: number, _1: number, _2: number): Float64Array;
}

interface EmbindModule {
  DoubleVector: {
    new(): DoubleVector;
  };
  Model: {
    new(_0: DoubleVector, _1: DoubleVector, _2: DoubleVector, _3: number): Model;
  };
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
