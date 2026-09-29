import {
  visitExpression,
  type IridiumBinaryOperator,
  type IridiumExpression,
  type IridiumExpressionBuiltinCall,
  type IridiumExpressionVisitor,
} from "../ir/ast.ts";
import type {
  BuiltinFunctionName,
  builtinFunctions,
} from "../runtime/builtins.ts";
import { OpCode, ValType } from "./codes";
import Emitter from "./Emitter";
import type { Scope } from "./scope.ts";
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
  /**
   * If a function is exported it is not accessible by Antimony code, but
   * is accessible from the WASM module.
   */
  isExported: boolean;
  isUserDefined?: boolean;
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

export type MacroFunction = {
  kind: "macro";
  name: string;
  depends?: string[];
  visit: (
    call: IridiumExpressionBuiltinCall,
    emitter: Emitter,
    visitor: IridiumExpressionVisitor<void>,
    scope: Scope,
  ) => void;
};

export type WasmFunction =
  | ImportedFunction
  | CompiledFunction
  | InlineFunction
  | MacroFunction;

export type FunctionInfo = {
  description?: string;
  arity: Arity;
};

export type Arity = number | { min: number; max?: number };

export const PIECEWISE_NAME = "piecewise";
export const AND_RESERVED_NAME = "$reserved_and";
export const OR_RESERVED_NAME = "$reserved_or";
export const POW_RESERVED_NAME = "$reserved_pow";
export const MOD_RESERVED_NAME = "$reserved_mod";

const createReciprocal = (functionName: string) => {
  return (functionsTable: FunctionTable): Uint8Array => {
    const emitter = new Emitter();
    emitter.emitListHeader(0);

    emitter.emitByte(OpCode.f64const);
    emitter.emitFloat64(1);

    emitter.emitByte(OpCode.localget);
    emitter.emitUint(0);

    emitter.emitCallOp(functionsTable.getBuiltin(functionName));

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

    emitter.emitCallOp(functionsTable.getBuiltin(functionName));

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

const createAliasFunction = (
  original: string,
  args: number,
): ((ft: FunctionTable) => Uint8Array) => {
  return (functionTable) => {
    const emitter = new Emitter();
    emitter.emitListHeader(0);
    for (let i = 0; i < args; i++) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(i);
    }
    emitter.emitCallOp(functionTable.getBuiltin(original));
    emitter.emitByte(OpCode.end);
    return emitter.getOutput();
  };
};

const flattenComparisonFunction = (
  { args, metadata }: IridiumExpressionBuiltinCall,
  op: IridiumBinaryOperator,
): IridiumExpression => {
  let current: IridiumExpression | undefined;
  let last = args[0];
  for (let i = 1; i < args.length; i++) {
    const main: IridiumExpression = {
      kind: "binary",
      op,
      left: last,
      right: args[i],
      metadata,
    };

    if (current) {
      current = {
        kind: "binary",
        op: "and",
        left: current,
        right: main,
        metadata,
      };
    } else {
      current = main;
    }

    last = args[i];
  }

  return current!;
};

type IsVariadicFunction<Name extends keyof typeof builtinFunctions> =
  (typeof builtinFunctions)[Name] extends { arity: { min: number } }
    ? Name
    : never;

// this ugly type is to ensure we have a definition for every builtin that is non-variadic
const builtinFunctionDefinitions: {
  [Name in BuiltinFunctionName as Name extends typeof PIECEWISE_NAME
    ? never
    : Name]: Name extends IsVariadicFunction<Name>
    ? Extract<WasmFunction, { kind: "macro" }> & { name: Name }
    :
        | (Extract<WasmFunction, { kind: "import" }> & { name: Name })
        | (Extract<WasmFunction, { kind: "compile" }> & { name: Name })
        | (Extract<WasmFunction, { kind: "inline" }> & { name: Name });
} = {
  neq: {
    kind: "inline",
    name: "neq",
    emit: (emitter) => {
      emitter.emitByte(OpCode.f64ne);
      emitter.emitByte(OpCode.f64convert_u_i32);
    },
  },
  abs: {
    kind: "inline",
    name: "abs",
    emit: (emitter) => emitter.emitByte(OpCode.f64abs),
  },
  ceil: {
    kind: "inline",
    name: "ceil",
    emit: (emitter) => {
      emitter.emitByte(OpCode.f64ceil);
    },
  },
  ceiling: {
    kind: "inline",
    name: "ceiling",
    emit: (emitter) => {
      emitter.emitByte(OpCode.f64ceil);
    },
  },
  exp: {
    kind: "import",
    name: "exp",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.exp,
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
  floor: {
    kind: "inline",
    name: "floor",
    emit: (emitter) => {
      emitter.emitByte(OpCode.f64floor);
    },
  },
  ln: {
    kind: "import",
    name: "ln",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.log,
  },
  log10: {
    kind: "import",
    name: "log10",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.log10,
  },
  power: {
    kind: "import",
    name: "power",
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    js: Math.pow,
  },
  pow: {
    kind: "compile",
    name: "pow",
    isExported: false,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    depends: ["power"],
    compileBody: createAliasFunction("power", 2),
  },
  quotient: {
    kind: "inline",
    name: "quotient",
    emit: (emitter) => {
      emitter.emitByte(OpCode.f64div);
      emitter.emitByte(OpCode.f64floor);
    },
  },
  rem: {
    kind: "compile",
    name: "rem",
    isExported: false,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    compileBody: (_functionTable) => {
      const emitter = new Emitter();

      emitter.emitListHeader(0);

      const a = "a";
      const b = "b";
      const localsTable = new LocalsSymbolTable([a, b]);

      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(a));

      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(b));

      emitter.emitByte(OpCode.f64div);
      emitter.emitByte(OpCode.f64ceil);

      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(a));

      emitter.emitByte(OpCode.localget);
      emitter.emitUint(localsTable.getParam(b));

      emitter.emitByte(OpCode.f64div);
      emitter.emitByte(OpCode.f64floor);

      emitter.emitByte(OpCode.f64sub);

      emitter.emitByte(OpCode.end);

      return emitter.getOutput();
    },
  },
  divide: {
    kind: "inline",
    name: "divide",
    emit: (emitter) => emitter.emitByte(OpCode.f64div),
  },
  sqrt: {
    kind: "inline",
    name: "sqrt",
    emit: (emitter) => emitter.emitByte(OpCode.f64sqrt),
  },
  sqr: {
    kind: "inline",
    name: "sqr",
    emit: (emitter) => emitter.emitByte(OpCode.f64sqrt),
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
  asin: {
    kind: "import",
    name: "asin",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.asin,
  },
  acos: {
    kind: "import",
    name: "acos",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.acos,
  },
  atan: {
    kind: "import",
    name: "atan",
    params: [ValType.f64],
    results: [ValType.f64],
    js: Math.atan,
  },

  // macros
  and: {
    kind: "macro",
    name: "and",
    visit: (expr, emitter, visitor) => {
      if (expr.args.length === 0) {
        emitter.emitF64ConstOp(1);
      } else {
        for (let i = 0; i < expr.args.length; i++) {
          if (i > 0) {
            emitter.emitByte(OpCode.if);
            emitter.emitByte(ValType.i32);
          }

          visitExpression(expr.args[i], visitor);

          emitter.emitF64ConstOp(0);
          emitter.emitByte(OpCode.f64ne);
        }

        for (let i = 0; i < expr.args.length - 1; i++) {
          emitter.emitByte(OpCode.else);
          emitter.emitI32ConstOp(0);
          emitter.emitByte(OpCode.end);
        }

        emitter.emitByte(OpCode.f64convert_u_i32);
      }
    },
  },
  or: {
    kind: "macro",
    name: "or",
    visit: (expr, emitter, visitor) => {
      if (expr.args.length === 0) {
        emitter.emitF64ConstOp(0);
      } else {
        for (let i = 0; i < expr.args.length; i++) {
          if (i > 0) {
            emitter.emitByte(OpCode.if);
            emitter.emitByte(ValType.i32);
          }

          visitExpression(expr.args[i], visitor);

          emitter.emitF64ConstOp(0);
          emitter.emitByte(OpCode.f64eq);
        }

        for (let i = 0; i < expr.args.length - 1; i++) {
          emitter.emitByte(OpCode.else);
          emitter.emitI32ConstOp(0);
          emitter.emitByte(OpCode.end);
        }

        emitter.emitByte(OpCode.i32eqz);
        emitter.emitByte(OpCode.f64convert_u_i32);
      }
    },
  },
  xor: {
    kind: "macro",
    name: "xor",
    visit: (expr, emitter, visitor) => {
      if (expr.args.length === 0) {
        emitter.emitF64ConstOp(0);
      } else {
        for (let i = 0; i < expr.args.length; i++) {
          visitExpression(expr.args[i], visitor);

          emitter.emitF64ConstOp(0);
          emitter.emitByte(OpCode.f64ne);

          if (i > 0) {
            emitter.emitByte(OpCode.i32xor);
          }
        }

        emitter.emitByte(OpCode.f64convert_u_i32);
      }
    },
  },
  plus: {
    kind: "macro",
    name: "plus",
    visit: (expr, emitter, visitor) => {
      if (expr.args.length === 0) {
        emitter.emitF64ConstOp(0);
      } else {
        for (let i = 0; i < expr.args.length; i++) {
          visitExpression(expr.args[i], visitor);
          if (i > 0) {
            emitter.emitByte(OpCode.f64add);
          }
        }
      }
    },
  },
  times: {
    kind: "macro",
    name: "times",
    visit: (expr, emitter, visitor) => {
      if (expr.args.length === 0) {
        emitter.emitF64ConstOp(1);
      } else {
        for (let i = 0; i < expr.args.length; i++) {
          visitExpression(expr.args[i], visitor);
          if (i > 0) {
            emitter.emitByte(OpCode.f64mul);
          }
        }
      }
    },
  },
  minus: {
    kind: "macro",
    name: "minus",
    visit: (expr, emitter, visitor) => {
      if (expr.args.length === 1) {
        visitExpression(expr.args[0], visitor);
        emitter.emitByte(OpCode.f64neg);
      } else {
        visitExpression(expr.args[0], visitor);
        visitExpression(expr.args[1], visitor);
        emitter.emitByte(OpCode.f64sub);
      }
    },
  },
  max: {
    kind: "macro",
    name: "max",
    visit: (expr, emitter, visitor) => {
      for (let i = 0; i < expr.args.length; i++) {
        visitExpression(expr.args[i], visitor);
        if (i > 0) {
          emitter.emitByte(OpCode.f64max);
        }
      }
    },
  },
  min: {
    kind: "macro",
    name: "min",
    visit: (expr, emitter, visitor) => {
      for (let i = 0; i < expr.args.length; i++) {
        visitExpression(expr.args[i], visitor);
        if (i > 0) {
          emitter.emitByte(OpCode.f64min);
        }
      }
    },
  },
  eq: {
    kind: "macro",
    name: "eq",
    depends: [AND_RESERVED_NAME],
    visit: (expr, _emitter, visitor) => {
      visitExpression(flattenComparisonFunction(expr, "eq"), visitor);
    },
  },
  lt: {
    kind: "macro",
    name: "lt",
    depends: [AND_RESERVED_NAME],
    visit: (expr, _emitter, visitor) => {
      visitExpression(flattenComparisonFunction(expr, "lt"), visitor);
    },
  },
  gt: {
    kind: "macro",
    name: "gt",
    depends: [AND_RESERVED_NAME],
    visit: (expr, _emitter, visitor) => {
      visitExpression(flattenComparisonFunction(expr, "gt"), visitor);
    },
  },
  leq: {
    kind: "macro",
    name: "leq",
    depends: [AND_RESERVED_NAME],
    visit: (expr, _emitter, visitor) => {
      visitExpression(flattenComparisonFunction(expr, "le"), visitor);
    },
  },
  geq: {
    kind: "macro",
    name: "geq",
    depends: [AND_RESERVED_NAME],
    visit: (expr, _emitter, visitor) => {
      visitExpression(flattenComparisonFunction(expr, "ge"), visitor);
    },
  },
  log: {
    kind: "macro",
    name: "log",
    depends: ["ln"],
    visit: (expr, emitter, visitor, scope) => {
      if (expr.args.length === 1) {
        visitExpression(expr.args[0], visitor);
        scope.emitBuiltinCallOp(emitter, "ln");
        emitter.emitF64ConstOp(Math.log(10));
      } else {
        visitExpression(expr.args[1], visitor);
        scope.emitBuiltinCallOp(emitter, "ln");
        visitExpression(expr.args[0], visitor);
        scope.emitBuiltinCallOp(emitter, "ln");
      }
      emitter.emitByte(OpCode.f64div);
    },
  },
  root: {
    kind: "macro",
    name: "root",
    depends: [POW_RESERVED_NAME],
    visit: (expr, emitter, visitor, scope) => {
      if (expr.args.length === 1) {
        visitExpression(expr.args[0], visitor);
      } else {
        visitExpression(expr.args[1], visitor);
      }
      emitter.emitF64ConstOp(1);
      if (expr.args.length === 1) {
        emitter.emitF64ConstOp(2);
      } else {
        visitExpression(expr.args[0], visitor);
      }
      emitter.emitByte(OpCode.f64div);
      scope.emitBuiltinCallOp(emitter, POW_RESERVED_NAME);
    },
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
  {
    kind: "compile",
    isExported: false,
    depends: ["rem"],
    name: MOD_RESERVED_NAME,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    compileBody: (functionTable) => {
      const emitter = new Emitter();
      emitter.emitListHeader(0);

      emitter.emitByte(OpCode.localget);
      emitter.emitUint(0);
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(1);

      emitter.emitCallOp(functionTable.getBuiltin("rem"));

      emitter.emitByte(OpCode.end);
      return emitter.getOutput();
    },
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
