import type {
  BuiltinFunctionName,
  builtinFunctions,
} from "antimony-language/semantic/builtins";
import { OpCode, ValType } from "./codes";
import Emitter from "./Emitter";
import { LocalsSymbolTable, type FunctionTable } from "./symbolTables.ts";

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
  /** If a function is exported it is not accessible by Antimony code. */
  isExported: boolean;
  name: string;
  params: ValType[];
  results: ValType[];
  depends?: string[];
  compileBody: (functionTable: FunctionTable) => Uint8Array;
};

export type InlineFunction = {
  kind: "inline";
  name: string;
  emit: (emitter: Emitter) => void;
};

export type WasmFunction = ImportedFunction | CompiledFunction | InlineFunction;

export const PIECEWISE_NAME = "piecewise";
export const AND_RESERVED_NAME = "$reserved_and";
export const OR_RESERVED_NAME = "$reserved_or";
export const POW_RESERVED_NAME = "$reserved_pow";

const createReciprocal = (functionName: string) => {
  return (functionsTable: FunctionTable): Uint8Array => {
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
  return (functionsTable: FunctionTable): Uint8Array => {
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

const createBooleanFunction = (
  emitOp: (emitter: Emitter) => void,
  putSecondParamOnTop: boolean = true,
) => {
  return () => {
    const a = "a";
    const b = "b";
    const tmp = "tmp";

    const emitter = new Emitter();
    const localsTable = new LocalsSymbolTable([a, b]);
    localsTable.addLocal(tmp);

    emitter.emitListHeader(1);
    emitter.emitUint(1);
    emitter.emitByte(ValType.i32);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(putSecondParamOnTop ? b : a));

    // convert to 0/1 int
    emitter.emitF64ConstOp(0);
    emitter.emitByte(OpCode.f64ne);

    emitter.emitByte(OpCode.localset);
    emitter.emitUint(localsTable.getLocal(tmp));

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getParam(putSecondParamOnTop ? a : b));

    // convert to 0/1 int
    emitter.emitF64ConstOp(0);
    emitter.emitByte(OpCode.f64ne);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(localsTable.getLocal(tmp));

    emitOp(emitter);

    emitter.emitByte(OpCode.f64convert_u_i32);

    emitter.emitByte(OpCode.end);

    return emitter.getOutput();
  };
};

type IsNonVariadicBuiltin<Name extends BuiltinFunctionName> =
  (typeof builtinFunctions)[Name] extends { arity: number } ? Name : never;

// this ugly type is to ensure we have a definition for every builtin that is non-variadic
const builtinFunctionDefinitions: {
  [Name in BuiltinFunctionName as IsNonVariadicBuiltin<Name>]: (typeof builtinFunctions)[Name] extends {
    arity: number;
  }
    ?
        | (Extract<WasmFunction, { kind: "import" }> & { name: Name })
        | (Extract<WasmFunction, { kind: "compile" }> & { name: Name })
        | (Extract<WasmFunction, { kind: "inline" }> & { name: Name })
    : never;
} = {
  abs: {
    kind: "inline",
    name: "abs",
    emit: (emitter) => emitter.emitByte(OpCode.f64abs),
  },
  ln: {
    kind: "import",
    name: "ln",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.log,
  },
  exp: {
    kind: "import",
    name: "exp",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.exp,
  },
  ceil: {
    kind: "inline",
    name: "ceil",
    emit: (emitter) => {
      emitter.emitByte(OpCode.f64ceil);
    },
  },
  floor: {
    kind: "inline",
    name: "floor",
    emit: (emitter) => {
      emitter.emitByte(OpCode.f64floor);
    },
  },
  factorial: {
    kind: "compile",
    isExported: false,
    name: "factorial",
    params: [ValType.f64],
    results: [ValType.f64],
    // TODO: add unit test for this?
    compileBody: (_functionTable) => {
      const emitter = new Emitter();

      const n = "N";
      const a = "A";

      const localsTable = new LocalsSymbolTable([n]);
      localsTable.addLocal(a);

      emitter.emitListHeader(1);
      emitter.emitUint(2);
      emitter.emitByte(ValType.f64);

      emitter.emitF64ConstOp(1);
      emitter.emitByte(OpCode.localset);
      emitter.emitUint(localsTable.getLocal(a));

      emitter.emitWhile(
        () => {
          emitter.emitByte(OpCode.localget);
          emitter.emitUint(localsTable.getParam(n));

          emitter.emitF64ConstOp(1);
          emitter.emitByte(OpCode.f64gt);
        },
        () => {
          emitter.emitByte(OpCode.localget);
          emitter.emitUint(localsTable.getLocal(a));
          emitter.emitByte(OpCode.localget);
          emitter.emitUint(localsTable.getParam(n));
          emitter.emitByte(OpCode.f64mul);

          emitter.emitByte(OpCode.localset);
          emitter.emitUint(localsTable.getLocal(a));

          emitter.emitByte(OpCode.localget);
          emitter.emitUint(localsTable.getParam(n));
          emitter.emitF64ConstOp(1);
          emitter.emitByte(OpCode.f64sub);

          emitter.emitByte(OpCode.localset);
          emitter.emitUint(localsTable.getParam(n));
        },
      );

      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getLocal(a));

      emitter.emitByte(OpCode.end);

      return emitter.getOutput();
    },
  },
  not: {
    kind: "inline",
    name: "not",
    emit: (emitter) => {
      emitter.emitF64ConstOp(0);
      emitter.emitByte(OpCode.f64eq);
      emitter.emitByte(OpCode.f64convert_u_i32);
    },
  },
  implies: {
    kind: "compile",
    isExported: false,
    name: "implies",
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    compileBody: createBooleanFunction((emitter) => {
      emitter.emitByte(OpCode.i32eqz);
      emitter.emitByte(OpCode.i32or);
    }, false),
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
  // This is not for the and() function, that is more like a macro.
  // This is for the and operator.
  {
    kind: "compile",
    isExported: false,
    name: AND_RESERVED_NAME,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    compileBody: createBooleanFunction((emitter) =>
      emitter.emitByte(OpCode.i32and),
    ),
  },
  // This is not for the or() function
  {
    kind: "compile",
    isExported: false,
    name: OR_RESERVED_NAME,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    compileBody: createBooleanFunction((emitter) =>
      emitter.emitByte(OpCode.i32or),
    ),
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
