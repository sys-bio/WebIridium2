import type { IridiumExpression } from "../ir/ast";
import { expr } from "../ir/dsl";

// TODO: implement ROOT and LOG

export const CSYMBOL_DEFINITION_URLS = new Map<string, IridiumExpression>([
  ["http://www.sbml.org/sbml/symbols/time", expr.var("time")],
  ["http://www.sbml.org/sbml/symbols/delay", expr.var("delay")],
  ["http://www.sbml.org/sbml/symbols/avogadro", expr.var("avogadro")],
  ["http://www.sbml.org/sbml/symbols/rateOf", expr.var("rateOf")],
  ["http://www.sbml.org/sbml/symbols/rateOf", expr.var("rateOf")],
]);

export const MATHML_CONSTANT_TAGS = new Map<string, IridiumExpression>([
  ["notanumber", expr.var("notanumber")],
  ["exponentiale", expr.var("exponentiale")],
  ["true", expr.var("true")],
  ["false", expr.var("false")],
  ["pi", expr.var("pi")],
  ["infinity", expr.var("infinity")],
]);

export const MATHML_FUNCTION_TAGS = new Map<string, IridiumExpression>([
  ["quotient", expr.var("quotient")],
  ["plus", expr.var("plus")],
  ["minus", expr.var("minus")],
  ["divide", expr.var("divide")],
  ["times", expr.var("times")],
  ["power", expr.var("power")],
  ["rem", expr.var("rem")],
  ["rem", expr.var("rem")],
  ["factorial", expr.var("factorial")],
  ["max", expr.var("max")],
  ["min", expr.var("min")],
  ["abs", expr.var("abs")],
  ["floor", expr.var("floor")],
  ["ceiling", expr.var("ceiling")],

  ["exp", expr.var("exp")],
  ["ln", expr.var("ln")],

  ["sin", expr.var("sin")],
  ["cos", expr.var("cos")],
  ["tan", expr.var("tan")],
  ["sec", expr.var("sec")],
  ["csc", expr.var("csc")],
  ["cot", expr.var("cot")],
  ["sinh", expr.var("sinh")],
  ["cosh", expr.var("cosh")],
  ["tanh", expr.var("tanh")],
  ["sech", expr.var("sech")],
  ["csch", expr.var("csch")],
  ["coth", expr.var("coth")],
  ["arcsin", expr.var("arcsin")],
  ["arccos", expr.var("arccos")],
  ["arctan", expr.var("arctan")],
  ["arccsc", expr.var("arccsc")],
  ["arccot", expr.var("arccot")],
  ["arctanh", expr.var("arctanh")],
  ["arcsech", expr.var("arcsech")],
  ["arccsch", expr.var("arccsch")],
  ["arccoth", expr.var("arccoth")],

  ["and", expr.var("and")],
  ["or", expr.var("or")],
  ["not", expr.var("not")],
  ["implies", expr.var("implies")],

  ["eq", expr.var("eq")],
  ["neq", expr.var("neq")],
  ["gt", expr.var("gt")],
  ["lt", expr.var("lt")],
  ["geq", expr.var("geq")],
  ["leq", expr.var("leq")],
]);
