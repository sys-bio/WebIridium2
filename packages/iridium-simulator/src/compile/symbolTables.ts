import type { ValType } from "./codes";
import type { FunctionInfo } from "./functions";
import type { WasmTypeDefinition } from "./wasm";

/**
 * Keeps track of indices for names.
 * Name indices start at 0 and increment by 1 for each new item.
 */
export class IndexSymbolTable {
  #map: Map<string, number>;

  constructor() {
    this.#map = new Map();
  }

  get size() {
    return this.#map.size;
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
  #userIndexes: Map<string, number>;
  #builtinIndexes: Map<string, number>;
  #userInfos: Map<string, FunctionInfo>;
  #currentIndex: number;

  constructor() {
    this.#userIndexes = new Map();
    this.#builtinIndexes = new Map();
    this.#userInfos = new Map();
    this.#currentIndex = 0;
  }

  /** Gets the index of a user-defined function. */
  getUser(funcName: string): number {
    const index = this.#userIndexes.get(funcName);
    if (index === undefined) {
      throw new Error(`Missing: ${funcName}`);
    }
    return index;
  }

  /** Gets the index of a built-in function. */
  getBuiltin(funcName: string): number {
    const index = this.#builtinIndexes.get(funcName);
    if (index === undefined) {
      throw new Error(`Missing built-in: ${funcName}`);
    }
    return index;
  }

  /** Gets the function info a user-defined function. */
  getUserInfo(funcName: string): FunctionInfo | undefined {
    return this.#userInfos.get(funcName);
  }

  /** Adds a user-defined function. */
  addUser(funcName: string, info: FunctionInfo): number {
    if (this.#userIndexes.has(funcName))
      throw new Error(`Duplicate user function: ${funcName}`);

    const index = this.#currentIndex++;
    this.#userIndexes.set(funcName, index);
    this.#userInfos.set(funcName, info);
    return index;
  }

  /** Adds a built-in function. */
  addBuiltin(funcName: string): number {
    if (this.#builtinIndexes.has(funcName))
      throw new Error(`Duplicate built-in: ${funcName}`);

    const index = this.#currentIndex++;
    this.#builtinIndexes.set(funcName, index);
    return index;
  }

  /** Adds an exported function (which is one that cannot be referred to within the assembly). */
  addExported(_funcName: string): number {
    return this.#currentIndex++;
  }

  /** Checks if the user-defined function exists. */
  hasUser(funcName: string): boolean {
    return this.#userIndexes.has(funcName);
  }

  /** Checks if the built-in function exists. */
  hasBuiltin(funcName: string): boolean {
    return this.#builtinIndexes.has(funcName);
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
