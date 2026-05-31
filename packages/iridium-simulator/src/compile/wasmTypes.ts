import type { ValType } from "./codes";

export type WasmTypeDefinition = {
  kind: "function";
  params: ValType[];
  results: ValType[];
};
