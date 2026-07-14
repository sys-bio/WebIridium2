import type { IridiumExpression } from "iridium-simulator";
import type { FormulaContext } from "../grammar";
import type { Metadata } from "./metadata";

export const compileFormula = (
  formula: FormulaContext,
): IridiumExpression<Metadata> => {
  throw new Error("TODO");
};
