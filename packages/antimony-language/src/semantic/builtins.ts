export const TIME_NAME = "time";

export const isBuiltinName = (name: string): boolean => {
  return (
    Object.hasOwn(builtinConstants, name) ||
    Object.hasOwn(builtinFunctions, name) ||
    name === TIME_NAME
  );
};

export const builtinEventOptions = [
  "t0",
  "priority",
  "fromTrigger",
  "persistent",
];

export type BuiltinConstantInfo = {
  description: string;
  value: number;
  unit?: string;
};

export const builtinConstants: Readonly<Record<string, BuiltinConstantInfo>> = {
  true: {
    description: "The true boolean value",
    value: 1,
  },
  false: {
    description: "The false boolean value",
    value: 0,
  },
  notanumber: {
    description: "Built-in constant for floating point NaN",
    value: NaN,
  },
  infinity: {
    description: "Built-in constant for floating point infinity",
    value: Infinity,
  },
  pi: {
    description: "Built-in constant for π",
    value: Math.PI,
  },
  exponentiale: {
    description: "Built-in constant for Euler's number",
    value: Math.E,
  },
  avogadro: {
    description: "Built-in constant representing the Avogadro constant.",
    value: 6.02214179e23,
    unit: "dimensionless",
  },
};

export type BuiltinFunctionInfo = {
  description: string;
  argumentCount: number;
};

export type BuiltinFunctionName = keyof typeof builtinFunctions;

export const builtinFunctions = {
  abs: {
    description: "Returns the absolute value.",
    argumentCount: 1,
  },
  ln: {
    description: "The natural logarithm",
    argumentCount: 1,
  },
  sin: {
    description: "The sine function",
    argumentCount: 1,
  },
  cos: {
    description: "The cosine function",
    argumentCount: 1,
  },
  tan: {
    description: "The tangent function",
    argumentCount: 1,
  },
  sec: {
    description: "The secant function",
    argumentCount: 1,
  },
  csc: {
    description: "The cosecant function",
    argumentCount: 1,
  },
  cot: {
    description: "The cotangent function",
    argumentCount: 1,
  },
  sinh: {
    description: "The hyperbolic sine function",
    argumentCount: 1,
  },
  cosh: {
    description: "The hyperbolic cosine function",
    argumentCount: 1,
  },
  tanh: {
    description: "The hyperbolic tangent function",
    argumentCount: 1,
  },
  sech: {
    description: "The hyperbolic secant function",
    argumentCount: 1,
  },
  csch: {
    description: "The hyperbolic cosecant function",
    argumentCount: 1,
  },
  coth: {
    description: "The hyperbolic cotangent function",
    argumentCount: 1,
  },
  arcsin: {
    description: "The inverse sine function",
    argumentCount: 1,
  },
  arccos: {
    description: "The inverse cosine function",
    argumentCount: 1,
  },
  arctan: {
    description: "The inverse tangent function",
    argumentCount: 1,
  },
  arcsec: {
    description: "The inverse secant function",
    argumentCount: 1,
  },
  arccsc: {
    description: "The inverse cosecant function",
    argumentCount: 1,
  },
  arccot: {
    description: "The inverse cotangent function",
    argumentCount: 1,
  },
  arcsinh: {
    description: "The inverse hyperbolic sine function",
    argumentCount: 1,
  },
  arccosh: {
    description: "The inverse hyperbolic cosine function",
    argumentCount: 1,
  },
  arctanh: {
    description: "The inverse hyperbolic tangent function",
    argumentCount: 1,
  },
  arcsech: {
    description: "The inverse hyperbolic secant function",
    argumentCount: 1,
  },
  arccsch: {
    description: "The inverse hyperbolic cosecant function",
    argumentCount: 1,
  },
  arccoth: {
    description: "The inverse hyperbolic cotangent function",
    argumentCount: 1,
  },
} satisfies Record<string, BuiltinFunctionInfo>;
