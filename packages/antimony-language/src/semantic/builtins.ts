export type BuiltinConstantInfo = {
  description: string;
  value: number;
  unit?: string;
};

export const TIME_NAME = "time";

export const builtinEventOptions = [
  "t0",
  "priority",
  "fromTrigger",
  "persistent",
];

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

export const isBuiltinName = (name: string): boolean => {
  return Object.hasOwn(builtinConstants, name) || name === TIME_NAME;
};
