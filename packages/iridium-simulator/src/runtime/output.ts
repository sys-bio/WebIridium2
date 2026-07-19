import type { RuntimeModel } from "./model";

export class TimeCourseOutput {
  model: RuntimeModel;
  buffer: Uint8Array;

  constructor(model: RuntimeModel, buffer: Uint8Array) {
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
}
