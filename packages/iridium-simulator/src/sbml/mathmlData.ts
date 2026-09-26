import type { IridiumExpression } from "../ir/ast";
import { expr } from "../ir/dsl";

export const CSYMBOL_DEFINITION_URLS = new Map<string, IridiumExpression>([
  ["http://www.sbml.org/sbml/symbols/time", expr.builtinVar("time")],
  ["http://www.sbml.org/sbml/symbols/delay", expr.builtinVar("delay")],
  ["http://www.sbml.org/sbml/symbols/avogadro", expr.builtinVar("avogadro")],
  ["http://www.sbml.org/sbml/symbols/rateOf", expr.builtinVar("rateOf")],
]);

export const MATHML_CONSTANT_TAGS = new Set<string>([
  "notanumber",
  "exponentiale",
  "true",
  "false",
  "pi",
  "infinity",
]);

export const MATHML_FUNCTION_TAGS = new Set<string>([
  "quotient",
  "plus",
  "minus",
  "divide",
  "times",
  "power",
  "rem",
  "rem",
  "factorial",
  "max",
  "min",
  "abs",
  "floor",
  "ceiling",

  "exp",
  "ln",
  "log",
  "root",

  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "sinh",
  "cosh",
  "tanh",
  "sech",
  "csch",
  "coth",
  "arcsin",
  "arccos",
  "arctan",
  "arccsc",
  "arccot",
  "arctanh",
  "arcsech",
  "arccsch",
  "arccoth",

  "and",
  "or",
  "not",
  "implies",

  "eq",
  "neq",
  "gt",
  "lt",
  "geq",
  "leq",
]);
