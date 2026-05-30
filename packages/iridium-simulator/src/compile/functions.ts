import type { BuiltinFunctionName } from "antimony-language/semantic/builtins";
import { OpCode, ValType } from "./codes";
import Emitter from "./Emitter";
import type { IndexSymbolTable } from "./symbolTables.ts";

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
  depends?: string[];
  compileBody: (functionTable: IndexSymbolTable) => Uint8Array;
};

export type InlineFunction = {
  kind: "inline";
  name: string;
  emit: (emitter: Emitter) => void;
};

export type WasmFunction = ImportedFunction | CompiledFunction | InlineFunction;

export const POW_RESERVED_NAME = "__pow_reserved";

const createReciprocal = (functionName: string) => {
  return (functionsTable: IndexSymbolTable): Uint8Array => {
    const emitter = new Emitter();
    emitter.emitListHeader(0);

    emitter.emitByte(OpCode.f64const);
    emitter.emitFloat64(1);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(0);

    emitter.emitCallOp(functionsTable.get(functionName));

    emitter.emitByte(OpCode.f64div);

    emitter.emitByte(OpCode.end);

    return emitter.getOutput();
  };
};

const createInverseReciprocal = (functionName: string) => {
  return (functionsTable: IndexSymbolTable): Uint8Array => {
    const emitter = new Emitter();
    emitter.emitListHeader(0);

    emitter.emitByte(OpCode.f64const);
    emitter.emitFloat64(1);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(0);

    emitter.emitByte(OpCode.f64div);

    emitter.emitCallOp(functionsTable.get(functionName));

    emitter.emitByte(OpCode.end);

    return emitter.getOutput();
  };
};

// is ugly type is to ensure we have a definition for every builtin
const builtinFunctionDefinitions: {
  [Name in BuiltinFunctionName]:
    | (Extract<WasmFunction, { kind: "import" }> & { name: Name })
    | (Extract<WasmFunction, { kind: "compile" }> & { name: Name })
    | (Extract<WasmFunction, { kind: "inline" }> & { name: Name });
} = {
  ln: {
    kind: "import",
    name: "ln",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.log,
  },
  abs: {
    kind: "inline",
    name: "abs",
    emit: (emitter) => emitter.emitByte(OpCode.f64abs),
  },
  sin: {
    kind: "import",
    name: "sin",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.sin,
  },
  cos: {
    kind: "import",
    name: "cos",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.cos,
  },
  tan: {
    kind: "import",
    name: "tan",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.tan,
  },
  sec: {
    kind: "compile",
    isExported: false,
    name: "sec",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["cos"],
    compileBody: createReciprocal("cos"),
  },
  csc: {
    kind: "compile",
    isExported: false,
    name: "csc",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["sin"],
    compileBody: createReciprocal("sin"),
  },
  cot: {
    kind: "compile",
    isExported: false,
    name: "cot",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["tan"],
    compileBody: createReciprocal("tan"),
  },
  sinh: {
    kind: "import",
    name: "sinh",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.sinh,
  },
  cosh: {
    kind: "import",
    name: "cosh",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.cosh,
  },
  tanh: {
    kind: "import",
    name: "tanh",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.tanh,
  },
  sech: {
    kind: "compile",
    isExported: false,
    name: "sech",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["cosh"],
    compileBody: createReciprocal("cosh"),
  },
  csch: {
    kind: "compile",
    isExported: false,
    name: "csch",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["sinh"],
    compileBody: createReciprocal("sinh"),
  },
  coth: {
    kind: "compile",
    isExported: false,
    name: "coth",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["tanh"],
    compileBody: createReciprocal("tanh"),
  },
  arcsin: {
    kind: "import",
    name: "arcsin",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.asin,
  },
  arccos: {
    kind: "import",
    name: "arccos",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.acos,
  },
  arctan: {
    kind: "import",
    name: "arctan",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.atan,
  },
  arcsec: {
    kind: "compile",
    isExported: false,
    name: "arcsec",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["arccos"],
    compileBody: createInverseReciprocal("arccos"),
  },
  arccsc: {
    kind: "compile",
    isExported: false,
    name: "arccsc",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["arcsin"],
    compileBody: createInverseReciprocal("arcsin"),
  },
  arccot: {
    kind: "compile",
    isExported: false,
    name: "arccot",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["arctan"],
    compileBody: createInverseReciprocal("arctan"),
  },
  arcsinh: {
    kind: "import",
    name: "arcsinh",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.asinh,
  },
  arccosh: {
    kind: "import",
    name: "arccosh",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.acosh,
  },
  arctanh: {
    kind: "import",
    name: "arctanh",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.atanh,
  },
  arcsech: {
    kind: "compile",
    isExported: false,
    name: "arcsech",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["arccosh"],
    compileBody: createInverseReciprocal("arccosh"),
  },
  arccsch: {
    kind: "compile",
    isExported: false,
    name: "arccsch",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["arcsinh"],
    compileBody: createInverseReciprocal("arcsinh"),
  },
  arccoth: {
    kind: "compile",
    isExported: false,
    name: "arccoth",
    params: [ValType.f64],
    results: [ValType.f64],
    depends: ["arctanh"],
    compileBody: createInverseReciprocal("arctanh"),
  },
};

const otherFunctionDefinitionsList: WasmFunction[] = [
  {
    kind: "import",
    name: POW_RESERVED_NAME,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    js: Math.pow,
  },
];

const otherFunctionDefinitions = Object.fromEntries(
  otherFunctionDefinitionsList.map((f) => [f.name, f]),
);

export const predefinedFuncDefs: Record<string, WasmFunction> = {
  ...builtinFunctionDefinitions,
  ...otherFunctionDefinitions,
};

export const inlineFunctions = new Set(
  Object.keys(predefinedFuncDefs).filter(
    (name) => predefinedFuncDefs[name].kind === "inline",
  ),
);
