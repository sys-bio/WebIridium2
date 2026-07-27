import type { RuntimeModel } from "./model";

export class TimeCourseOutput {
  model: RuntimeModel;
  buffer: Float64Array;

  constructor(model: RuntimeModel, buffer: Float64Array) {
    this.model = model;
    this.buffer = buffer;
  }

  #columnNames: string[] | undefined;
  get columnNames(): string[] {
    if (!this.#columnNames) {
      const names: string[] = [];

      for (const v of this.model.y) {
        names.push(v.name);
      }
      for (const v of this.model.p) {
        names.push(v.name);
      }
      for (const v of this.model.reactions) {
        names.push(v);
      }

      this.#columnNames = names;
    }

    return this.#columnNames;
  }

  get columnCount() {
    return (
      this.model.y.length + this.model.p.length + this.model.reactions.length
    );
  }

  get rowCount() {
    return this.buffer.length / this.columnCount;
  }

  getColumnIndex(name: string): number {
    let i = 0;

    for (const y of this.model.y) {
      if (y.name === name) return i;
      i++;
    }

    for (const p of this.model.p) {
      if (p.name === name) return i;
      i++;
    }

    for (const r of this.model.reactions) {
      if (r === name) return i;
      i++;
    }

    return -1;
  }

  /**
   * @returns - values in the column of given index
   */
  sliceColumn(index: number): number[];

  /**
   * @returns - values in the column of given name
   */
  sliceColumn(name: string): number[];

  sliceColumn(nameOrIndex: string | number): number[] {
    let index: number;
    if (typeof nameOrIndex === "string") {
      index = this.getColumnIndex(nameOrIndex);
      if (index === -1) {
        throw new Error(`Unknown column name: ${nameOrIndex}.`);
      }
    }

    const columnCount = this.columnCount;

    const slice = new Array(this.rowCount);
    for (let i = 0; i < this.rowCount; i++) {
      slice[i] = this.buffer[i + columnCount * i];
    }

    return slice;
  }
}
