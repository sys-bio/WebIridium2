import { TIME_NAME } from "../names";
import type { RuntimeModel } from "./model";

const escapeCsv = (text: string): string => {
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return '"' + text.replaceAll('"', '""') + '"';
  } else {
    return text;
  }
};

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

      names.push(TIME_NAME);

      this.#columnNames = names;
    }

    return this.#columnNames;
  }

  get columnCount() {
    return (
      1 +
      this.model.y.length +
      this.model.p.length +
      this.model.reactions.length
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

    if (name === TIME_NAME) {
      return i;
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
    } else {
      index = nameOrIndex;
    }

    const columnCount = this.columnCount;

    const slice = new Array(this.rowCount) as number[];
    for (let i = 0; i < this.rowCount; i++) {
      slice[i] = this.buffer[index + columnCount * i];
    }

    return slice;
  }

  /**
   * @returns - the output as as a csv string
   */
  toCsv(): string {
    const lines = [];
    const colCount = this.columnCount;
    const rowCount = this.rowCount;

    lines.push(this.columnNames.map(escapeCsv).join(","));

    for (let y = 0; y < rowCount; y++) {
      const line = [];
      for (let x = 0; x < colCount; x++) {
        line.push(this.buffer[x + y * colCount]);
      }
      lines.push(line.join(","));
    }

    return lines.join("\n");
  }
}
