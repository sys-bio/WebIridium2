import type { ValType } from "./codes";

export type WasmTypeDefinition = {
  kind: "function";
  params: ValType[];
  results: ValType[];
};

/** Keeps track of type indices. */
export class TypeTable {
  #map: Map<string, { definition: WasmTypeDefinition; index: number }>;

  constructor() {
    this.#map = new Map();
  }

  #hashFunc(params: ValType[], results: ValType[]): string {
    return params.join(",") + "->" + results.join(",");
  }

  getFunc(params: ValType[], results: ValType[]): number {
    const hash = this.#hashFunc(params, results);
    const got = this.#map.get(hash);
    if (got === undefined) {
      throw new Error(`Missing: ${hash}`);
    }
    return got.index;
  }

  /** Does not throw on duplicate since we can have duplicate types. */
  addFunc(params: ValType[], results: ValType[]): number {
    const hash = this.#hashFunc(params, results);
    let got = this.#map.get(hash);
    if (got) {
      return got.index;
    }

    got = {
      definition: {
        kind: "function",
        params: params,
        results: results,
      },
      index: this.#map.size,
    };
    this.#map.set(hash, got);
    return got.index;
  }

  get size() {
    return this.#map.size;
  }

  [Symbol.iterator](): Iterator<{
    definition: WasmTypeDefinition;
    index: number;
  }> {
    return this.#map.values();
  }
}
