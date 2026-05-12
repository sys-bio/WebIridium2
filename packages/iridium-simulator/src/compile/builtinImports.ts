import { ValType } from "./codes";

export type BuiltinFunctionDescription = {
  name: string;
  params: ValType[];
  results: ValType[];
  // eslint-disable-next-line
  js: Function;
};

export const POW_RESERVED_NAME = "__pow_reserved";

const builtinFunctionsList: BuiltinFunctionDescription[] = [
  {
    name: POW_RESERVED_NAME,
    params: [ValType.f64, ValType.f64],
    results: [ValType.f64],
    js: Math.pow,
  },
];

export const builtinFunctions = Object.fromEntries(
  builtinFunctionsList.map((f) => [f.name, f]),
);
