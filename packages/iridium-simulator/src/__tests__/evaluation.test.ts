import { describe, expect, it } from "vitest";
import { deriveModels } from "antimony-language/semantic";
import { CompileModelError } from "../compile/errors.ts";
import { createInternalModel } from "../compile/model.ts";
import {
  evaluateInitialValues,
  getAssignmentOrder,
} from "../compile/evaluate.ts";

const evaluateModel = (code: string) => {
  const models = deriveModels(code);
  return evaluateInitialValues(createInternalModel(models));
};

const getAssignmentOrderFromCode = (
  code: string,
  options?: { allowSelfCycle?: boolean },
): string[] => {
  const models = deriveModels(code);
  const model = createInternalModel(models);
  return getAssignmentOrder(
    new Map(
      Array.from(model.variables.values())
        .filter((v) => v.assignment?.kind !== "rule")
        .map((v) => [
          v.name,
          v.assignment?.kind !== "rule" ? v.assignment?.initial : undefined,
        ]),
    ),
    options,
  );
};

describe("evaluation order", () => {
  it("should produce a dependency-ordered assignment list", () => {
    expect(getAssignmentOrderFromCode("A = B + 1; B = C + 2; C = 3")).toEqual([
      "C",
      "B",
      "A",
    ]);
  });

  it("should not allow self-cycles when not permitted", () => {
    expect(() => getAssignmentOrderFromCode("A = A + 5")).toThrow(
      CompileModelError,
    );
  });

  it("should allow self-cycles when permitted", () => {
    expect(
      getAssignmentOrderFromCode("A = A + 5; B = 5", { allowSelfCycle: true }),
    ).toEqual(["A", "B"]);
  });

  it("should not allow cycles even with self-cycles", () => {
    expect(() =>
      getAssignmentOrderFromCode("A = A + B; B = A + 5", {
        allowSelfCycle: true,
      }),
    ).toThrow(CompileModelError);
  });

  it("should evaluate initial values in the correct topological order", () => {
    const initialValues = evaluateModel(
      "C = A + 1; B = C + 2; A = 1; D = A + B + C",
    );

    expect(initialValues.get("A")).toBe(1);
    expect(initialValues.get("C")).toBe(2);
    expect(initialValues.get("B")).toBe(4);
    expect(initialValues.get("D")).toBe(7);
  });

  it("should not include assignment rules in initial values", () => {
    const initialValues = evaluateModel(
      "C = A + 1; B = C + 2; A = 1; Total := A + B + C",
    );

    expect(initialValues.get("A")).toBe(1);
    expect(initialValues.get("C")).toBe(2);
    expect(initialValues.get("B")).toBe(4);
    expect(initialValues.get("Total")).toBeUndefined();
  });

  it("should throw CompileError for cyclic assignments", () => {
    expect(() => evaluateModel("A = B + 1; B = A + 1")).toThrow(
      CompileModelError,
    );
  });

  it("should throw CompileError for cyclic assignments big", () => {
    expect(() =>
      evaluateModel(`
      A = B + 1; B = C + 1; C = D + 1;
      D = E + F;
      E = G + 1; F = G + 1;
      G = A + 1
    `),
    ).toThrow(CompileModelError);
  });
});
