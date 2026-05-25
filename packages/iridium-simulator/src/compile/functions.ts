import { OpCode, ValType } from "./codes";
import type Emitter from "./Emitter";
import type { IndexSymbolTable } from "./SymbolTable";

export type ImportedFunction = {
  kind: "import";
  name: string;
  params: ValType[];
  results: ValType[];
  // eslint-disable-next-line
  js: Function;
};

export type CompiledFunction = {
  kind: "compile";
  isExported: boolean;
  name: string;
  params: ValType[];
  results: ValType[];
  compileBody: (functionTable: IndexSymbolTable) => Uint8Array;
};

export type InlineFunction = {
  kind: "inline";
  name: string;
  emit: (emitter: Emitter) => void;
};

export type WasmFunction = ImportedFunction | CompiledFunction | InlineFunction;

export const POW_RESERVED_NAME = "__pow_reserved";

const builtinFunctionsList: WasmFunction[] = [
  {
    kind: "import",
    name: POW_RESERVED_NAME,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    js: Math.pow,
  },
  {
    kind: "import",
    name: "ln",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.log,
  },
  {
    kind: "import",
    name: "sin",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.sin,
  },
  {
    kind: "import",
    name: "cos",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.cos,
  },
  {
    kind: "import",
    name: "tan",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.tan,
  },
  {
    kind: "inline",
    name: "abs",
    emit: (emitter) => emitter.emitByte(OpCode.f64abs),
  },
];

export const builtinFunctions = Object.fromEntries(
  builtinFunctionsList.map((f) => [f.name, f]),
);

export const inlineFunctions = new Set(
  Object.keys(builtinFunctions).filter(
    (name) => builtinFunctions[name].kind === "inline",
  ),
);
