import type { FunctionInfo } from "../compile/functions";

export const TIME_NAME = "time";
export const RATE_OF_NAME = "rateOf";

export const isBuiltinName = (name: string): boolean => {
  return (
    Object.hasOwn(builtinConstants, name) ||
    Object.hasOwn(builtinFunctions, name) ||
    name === TIME_NAME
  );
};

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

export type BuiltinFunctionName = keyof typeof builtinFunctions;

// TODO: add divide

export const builtinFunctions = {
  piecewise: {
    description: "TODO: explain this",
    arity: { min: 1 },
  },

  abs: {
    description: "Returns the absolute value.",
    arity: 1,
  },
  ceil: {
    description: "Round up to the next integer.",
    arity: 1,
  },
  ceiling: {
    description: "Round up to the next integer.",
    arity: 1,
  },
  exp: {
    description: "The exponential function.",
    arity: 1,
  },
  factorial: {
    description: "The factorial function.",
    arity: 1,
  },
  floor: {
    description: "Round down to the next integer.",
    arity: 1,
  },
  ln: {
    description: "The natural logarithm.",
    arity: 1,
  },
  log: {
    description:
      "Returns the log of the second argument with the base of the first argument. If only one argument is provided, a default base of 10 is used.",
    arity: { min: 1, max: 2 },
  },
  log10: {
    description: "The logarithm function with base 10",
    arity: 1,
  },
  root: {
    description:
      "Returns the root of the second argument where the first argument is the degree. If only one argument is provided, a default degree of 2 is used.",
    arity: { min: 1, max: 2 },
  },
  power: {
    description: "Raise the first argument to the power of the second.",
    arity: 2,
  },
  pow: {
    description: "Alias for power",
    arity: 2,
  },
  max: {
    description: "Returns the argument with the maximum value.",
    arity: { min: 1 },
  },
  min: {
    description: "Returns the argument with the minimum value.",
    arity: { min: 1 },
  },
  plus: {
    description: "Returns sum of its arguments.",
    arity: { min: 0 },
  },
  minus: {
    description:
      "Returns the first argument minus the second. If only one argument, returns the negative version of it.",
    arity: { min: 1, max: 2 },
  },
  quotient: {
    description:
      "Returns the integer quotient of dividing the first operand by the second.",
    arity: 2,
  },
  rem: {
    description:
      "Returns the remainder from dividing the first operand by the second.",
    arity: 2,
  },
  divide: {
    description: "Returns the first argument divided by the second",
    arity: 2,
  },
  sqrt: {
    description: "Returns the square root.",
    arity: 1,
  },
  sqr: {
    description: "Alias for sqrt.",
    arity: 1,
  },
  times: {
    description: "Returns product of its arguments",
    arity: { min: 0 },
  },

  // Logical
  and: {
    description: "Returns true if all arguments are true or false otherwise.",
    arity: { min: 0 },
  },
  or: {
    description:
      "Returns true if at least one argument is true or false otherwise.",
    arity: { min: 0 },
  },
  xor: {
    description:
      "Returns true if there are an odd number of true arguments or false otherwise.",
    arity: { min: 0 },
  },
  not: {
    description:
      "Returns true if the argument is false and false if it is true.",
    arity: 1,
  },
  implies: {
    description:
      "Returns false if the first argument is true and the second argument is false, otherwise returns true.",
    arity: 2,
  },

  // Comparison
  eq: {
    description: "Returns true if all arguments are equal and false otherwise.",
    arity: { min: 2 },
  },
  neq: {
    description:
      "Returns true if both arguments are different and false otherwise.",
    arity: 2,
  },
  gt: {
    description:
      "Returns true if every argument is greater than every argument after it and false otherwise.",
    arity: { min: 2 },
  },
  lt: {
    description:
      "Returns true if every argument is less than every argument after it and false otherwise.",
    arity: { min: 2 },
  },
  geq: {
    description:
      "Returns true if every argument is greater than or equal every argument after it and false otherwise.",
    arity: { min: 2 },
  },
  leq: {
    description:
      "Returns true if every argument is less than or equal every argument after it and false otherwise.",
    arity: { min: 2 },
  },

  // Trig
  sin: {
    description: "The sine function",
    arity: 1,
  },
  cos: {
    description: "The cosine function",
    arity: 1,
  },
  tan: {
    description: "The tangent function",
    arity: 1,
  },
  sec: {
    description: "The secant function",
    arity: 1,
  },
  csc: {
    description: "The cosecant function",
    arity: 1,
  },
  cot: {
    description: "The cotangent function",
    arity: 1,
  },
  sinh: {
    description: "The hyperbolic sine function",
    arity: 1,
  },
  cosh: {
    description: "The hyperbolic cosine function",
    arity: 1,
  },
  tanh: {
    description: "The hyperbolic tangent function",
    arity: 1,
  },
  sech: {
    description: "The hyperbolic secant function",
    arity: 1,
  },
  csch: {
    description: "The hyperbolic cosecant function",
    arity: 1,
  },
  coth: {
    description: "The hyperbolic cotangent function",
    arity: 1,
  },
  arcsin: {
    description: "The inverse sine function",
    arity: 1,
  },
  arccos: {
    description: "The inverse cosine function",
    arity: 1,
  },
  arctan: {
    description: "The inverse tangent function",
    arity: 1,
  },
  arcsec: {
    description: "The inverse secant function",
    arity: 1,
  },
  arccsc: {
    description: "The inverse cosecant function",
    arity: 1,
  },
  arccot: {
    description: "The inverse cotangent function",
    arity: 1,
  },
  arcsinh: {
    description: "The inverse hyperbolic sine function",
    arity: 1,
  },
  arccosh: {
    description: "The inverse hyperbolic cosine function",
    arity: 1,
  },
  arctanh: {
    description: "The inverse hyperbolic tangent function",
    arity: 1,
  },
  arcsech: {
    description: "The inverse hyperbolic secant function",
    arity: 1,
  },
  arccsch: {
    description: "The inverse hyperbolic cosecant function",
    arity: 1,
  },
  arccoth: {
    description: "The inverse hyperbolic cotangent function",
    arity: 1,
  },

  // Trig alternate names
  asin: {
    description: "The inverse sine function",
    arity: 1,
  },
  acos: {
    description: "The inverse cosine function",
    arity: 1,
  },
  atan: {
    description: "The inverse tangent function",
    arity: 1,
  },
} satisfies Record<string, FunctionInfo>;
