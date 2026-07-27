import type { ValType } from "./codes";

export const WASM_PAGE_SIZE = 65_536;

export type WasmTypeDefinition = {
  kind: "function";
  params: ValType[];
  results: ValType[];
};
