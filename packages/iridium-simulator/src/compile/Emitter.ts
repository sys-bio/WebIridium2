import {
  CompositeType,
  ExternType,
  LimitFlag,
  type SectionCode,
  type ValType,
} from "./codes";

const INITIAL_CAPACITY = 32;
const RESIZE_FACTOR = 2;

/**
 * Function that emits code to load variable onto the stack.
 **/
export type EmitLoadVariableFunction = (emitter: Emitter, name: string) => void;

/**
 * Helper to generate and emit WASM bytecode.
 */
class Emitter {
  #view: DataView;
  #cursor: number;

  constructor() {
    this.#view = new DataView(new ArrayBuffer(INITIAL_CAPACITY));
    this.#cursor = 0;
  }

  #increaseCapacity(): void {
    const buffer = new ArrayBuffer(
      this.#view.buffer.byteLength * RESIZE_FACTOR,
    );

    new Uint8Array(buffer).set(new Uint8Array(this.#view.buffer));

    this.#view = new DataView(buffer);
  }

  #ensureCapacity(bytes: number): void {
    while (this.#cursor + bytes >= this.#view.buffer.byteLength) {
      this.#increaseCapacity();
    }
  }

  /** @returns - array of emitted bytecode */
  getOutput(): Uint8Array {
    return new Uint8Array(this.#view.buffer, 0, this.#cursor);
  }

  /* Values (https://webassembly.github.io/spec/core/binary/values.html) */

  emitByte(byte: number): void {
    this.#ensureCapacity(0);
    this.#view.setUint8(this.#cursor++, byte);
  }

  // Copied from the Wikipedia page: https://en.wikipedia.org/wiki/LEB128
  #emitUnsignedLEB128(n: number): void {
    do {
      let byte = n & 0b0111_1111;
      n >>>= 7;
      if (n != 0) byte |= 0b1000_0000;

      this.#ensureCapacity(1);
      this.#view.setUint8(this.#cursor++, byte);
    } while (n != 0);
  }

  #emitSignedLEB128(n: number): void {
    let more = true;

    while (more) {
      let byte = n & 0b0111_1111;
      n >>= 7;

      const signBit = byte & 0b0100_0000;
      if ((n === 0 && signBit === 0) || (n === -1 && signBit !== 0))
        more = false;
      else byte |= 0b1000_0000;

      this.#ensureCapacity(1);
      this.#view.setUint8(this.#cursor++, byte);
    }
  }

  emitUint32(n: number): void {
    this.#emitUnsignedLEB128(n);
  }

  emitSint32(n: number): void {
    this.#emitSignedLEB128(n);
  }

  emitFloat64(n: number): void {
    this.#ensureCapacity(8);
    this.#view.setFloat64(this.#cursor, n, true);
    this.#cursor += 8;
  }

  emitName(str: string): void {
    const bytes = new TextEncoder().encode(str); // converts string to uint8array
    this.emitListHeader(bytes.length);
    this.#ensureCapacity(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      this.#view.setUint8(this.#cursor++, bytes[i]);
    }
  }

  /* Lists (https://webassembly.github.io/spec/core/binary/conventions.html#lists) */

  emitListHeader(length: number): void {
    this.emitUint32(length);
  }

  /* Sections */

  emitSection(code: SectionCode, content: Uint8Array): void {
    this.emitByte(code);
    this.emitUint32(content.byteLength);
    this.appendBytes(content);
  }

  appendBytes(content: Uint8Array): void {
    this.#ensureCapacity(content.byteLength);
    new Uint8Array(this.#view.buffer).set(content, this.#cursor);
    this.#cursor += content.byteLength;
  }

  /* Types */

  emitFunctionType(params: ValType[], results: ValType[]): void {
    this.emitByte(CompositeType.func);

    this.emitListHeader(params.length);
    for (const param of params) {
      this.emitByte(param);
    }

    this.emitListHeader(results.length);
    for (const result of results) {
      this.emitByte(result);
    }
  }

  emitExternFunctionType(functionIndex: number): void {
    this.emitByte(ExternType.func);
    this.emitUint32(functionIndex);
  }

  emitExternMemoryType(minPages: number, maxPages?: number): void {
    this.emitByte(ExternType.mem);
    this.emitLimits(minPages, maxPages);
  }

  emitLimits(min: number, max?: number): void {
    if (max !== undefined) {
      this.emitByte(LimitFlag.i32minMax);
      this.emitUint32(min);
      this.emitUint32(max);
    } else {
      this.emitByte(LimitFlag.i32minOnly);
      this.emitUint32(min);
    }
  }
}

export default Emitter;
