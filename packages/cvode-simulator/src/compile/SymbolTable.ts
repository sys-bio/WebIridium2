/**
 * Keeps track of indices for names.
 * Name indices start at 0 and increment by 1 for each new item.
 */
export class IndexSymbolTable {
  #map: Map<unknown, number>;

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
}

export class LocalsSymbolTable {
  #paramMap: Map<unknown, number>;
  #localsMap: Map<unknown, number>;

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

  addLocal(local: string): number {
    if (this.#localsMap.has(local)) throw new Error(`Duplicate: ${local}`);

    const index = this.#paramMap.size + this.#localsMap.size;
    this.#localsMap.set(local, this.#paramMap.size);
    return index;
  }
}
