import { describe, expect, it } from "vitest";
import { deriveModels } from "antimony-language/semantic";
import type { FormulaContext } from "antimony-language/grammar";
import { CompileModelError } from "../compile/errors.ts";
import { createInternalModel } from "../compile/model.ts";
import { evaluateInitialValues, getAssignmentOrder } from "../compile/evaluate.ts";
import { TIME_NAME } from "../names.ts";

const evaluateModel = (code: string) => {
  const models = deriveModels(code);
  return evaluateInitialValues(createInternalModel(models));
};

describe("evaluation order", () => {
  it("should produce a dependency-ordered assignment list", () => {
    const assignments = new Map<string, FormulaContext | undefined>();

    const [model] = deriveModels("A = B + 1; B = C + 2; C = 3");
    for (const variable of model.variables.values()) {
      assignments.set(variable.name, variable.assignment?.kind === "set" ? variable.assignment.initial : undefined);
    }

    expect(getAssignmentOrder(assignments)).toEqual(["C", "B", "A"]);
  });

  it("should evaluate initial values in the correct topological order", () => {
    const initialValues = evaluateModel("C = A + 1; B = C + 2; A = 1; D = A + B + C");

    expect(initialValues.get(TIME_NAME)).toBe(0);
    expect(initialValues.get("A")).toBe(1);
    expect(initialValues.get("C")).toBe(2);
    expect(initialValues.get("B")).toBe(4);
    expect(initialValues.get("D")).toBe(7);
  });

  it("should throw CompileError for cyclic assignments", () => {
    expect(() => evaluateModel("A = B + 1; B = A + 1")).toThrow(CompileModelError);
  });

  it("should throw CompileError for cyclic assignments big", () => {
    expect(() => evaluateModel(`
      A = B + 1; B = C + 1; C = D + 1;
      D = E + F;
      E = G + 1; F = G + 1;
      G = A + 1
    `)).toThrow(CompileModelError);
  });
});
