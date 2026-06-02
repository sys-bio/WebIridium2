import type { ValType } from "./codes";
import type { WasmTypeDefinition } from "./wasmTypes";

/**
 * Keeps track of indices for names.
 * Name indices start at 0 and increment by 1 for each new item.
 */
export class IndexSymbolTable {
  #map: Map<string, number>;

  constructor() {
    this.#map = new Map();
  }

  /**
   * Gets index for item.
   * @throws - if item is not found
   */
  get(item: string): number {
    const index = this.#map.get(item);
    if (index === undefined) {
      throw new Error(`Missing: ${item}`);
    }
    return index;
  }

  /**
   * Adds item.
   * @throws - if item is already found
   */
  add(item: string): number {
    if (this.#map.has(item)) throw new Error(`Duplicate: ${item}`);

    const index = this.#map.size;
    this.#map.set(item, this.#map.size);
    return index;
  }

  has(item: string): boolean {
    return this.#map.has(item);
  }

  keys(): string[] {
    return Array.from(this.#map.keys());
  }
}

/**
 * Similar to IndexSymbolTable but has `addExported` method which cannot be
 * accessed by `get`. (since these are meant for external code).
 */
export class FunctionTable {
  #map: Map<string, number>;
  #exposedMap: Map<string, number>;

  constructor() {
    this.#map = new Map();
    this.#exposedMap = new Map();
  }

  get(funcName: string): number {
    const index = this.#exposedMap.get(funcName);
    if (index === undefined) {
      throw new Error(`Missing: ${funcName}`);
    }
    return index;
  }

  add(funcName: string): number {
    if (this.#map.has(funcName)) throw new Error(`Duplicate: ${funcName}`);

    const index = this.#map.size;
    this.#exposedMap.set(funcName, index);
    this.#map.set(funcName, index);
    return index;
  }

  addExported(funcName: string): number {
    funcName = "$reserved_export_" + funcName;
    if (this.#map.has(funcName)) throw new Error(`Duplicate: ${funcName}`);

    const index = this.#map.size;
    this.#map.set(funcName, index);
    return index;
  }

  has(funcName: string): boolean {
    return this.#exposedMap.has(funcName);
  }
}

export class LocalsSymbolTable {
  #paramMap: Map<string, number>;
  #localsMap: Map<string, number>;

  constructor(params: string[]) {
    this.#paramMap = new Map();
    this.#localsMap = new Map();

    for (const param of params) {
      this.#paramMap.set(param, this.#paramMap.size);
    }
  }

  getParam(param: string): number {
    const index = this.#paramMap.get(param);
    if (index === undefined) {
      throw new Error(`Missing: ${param}`);
    }
    return index;
  }

  getLocal(local: string): number {
    const index = this.#localsMap.get(local);
    if (index === undefined) {
      throw new Error(`Missing: ${local}`);
    }
    return index;
  }

  hasParam(local: string): boolean {
    return this.#paramMap.has(local);
  }

  addLocal(local: string): number {
    if (this.#localsMap.has(local)) throw new Error(`Duplicate: ${local}`);

    const index = this.#paramMap.size + this.#localsMap.size;
    this.#localsMap.set(local, index);
    return index;
  }
}

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
