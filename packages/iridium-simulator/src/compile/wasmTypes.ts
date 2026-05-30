import type { ValType } from "./codes";

export type WasmTypeDefinition = {
  kind: "function";
  params: ValType[];
  results: ValType[];
};

export const WASM_TRUE = 1;
export const WASM_FALSE = 0;
