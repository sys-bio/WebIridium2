import { describe, expect, it } from "vitest";
import { CompileModelError } from "../compile/errors.ts";
import {
  evaluateInitialValues,
  getAssignmentOrder,
} from "../compile/evaluate.ts";
import { Compilation } from "../compile/Compilation.ts";
import type { IridiumExpression } from "../ir/ast.ts";
import { assignmentVariable, expr, parameter, model } from "../ir/dsl.ts";

const evaluateModel = (modelOptions: Parameters<typeof model>[0]) => {
  return evaluateInitialValues(new Compilation(model(modelOptions)));
};

const getAssignmentOrderFromExprs = (
  assignments: Record<string, IridiumExpression>,
): string[] => {
  return getAssignmentOrder(new Map(Object.entries(assignments)));
};

describe("evaluation order", () => {
  it("should produce a dependency-ordered assignment list", () => {
    expect(
      getAssignmentOrderFromExprs({
        A: expr.add(expr.var("B"), expr.num(1)),
        B: expr.add(expr.var("C"), expr.num(2)),
        C: expr.num(3),
      }),
    ).toEqual(["C", "B", "A"]);
  });

  it("should not allow self-cycles when not permitted", () => {
    expect(() =>
      getAssignmentOrderFromExprs({ A: expr.add(expr.var("A"), expr.num(5)) }),
    ).toThrow(CompileModelError);
  });

  it("should evaluate initial values in the correct topological order", async () => {
    const initialValues = await evaluateModel({
      variables: {
        A: parameter(expr.num(1)),
        B: parameter(expr.add(expr.var("C"), expr.num(2))),
        C: parameter(expr.add(expr.var("A"), expr.num(1))),
        D: parameter(
          expr.add(expr.var("A"), expr.add(expr.var("B"), expr.var("C"))),
        ),
      },
    });

    expect(initialValues.get("A")).toBe(1);
    expect(initialValues.get("C")).toBe(2);
    expect(initialValues.get("B")).toBe(4);
    expect(initialValues.get("D")).toBe(7);
  });

  it("should include assignment rules in initial values", async () => {
    const initialValues = await evaluateModel({
      variables: {
        A: parameter(expr.num(1)),
        B: parameter(expr.add(expr.var("C"), expr.num(2))),
        C: parameter(expr.add(expr.var("A"), expr.num(1))),
        Total: assignmentVariable(
          expr.add(expr.var("A"), expr.add(expr.var("B"), expr.var("C"))),
        ),
      },
    });

    expect(initialValues.get("A")).toBe(1);
    expect(initialValues.get("C")).toBe(2);
    expect(initialValues.get("B")).toBe(4);
    expect(initialValues.get("Total")).toBe(7);
  });

  it("should throw CompileModelError for cyclic assignments", () => {
    expect(() =>
      evaluateModel({
        variables: {
          A: parameter(expr.add(expr.var("B"), expr.num(1))),
          B: parameter(expr.add(expr.var("A"), expr.num(1))),
        },
      }),
    ).toThrow(CompileModelError);
  });

  it("should throw CompileModelError for cyclic assignments", () => {
    expect(() =>
      evaluateModel({
        variables: {
          A: parameter(expr.add(expr.var("B"), expr.num(1))),
          B: parameter(expr.add(expr.var("C"), expr.num(1))),
          C: parameter(expr.add(expr.var("D"), expr.num(1))),
          D: parameter(expr.add(expr.var("E"), expr.var("F"))),
          E: parameter(expr.add(expr.var("G"), expr.num(1))),
          F: parameter(expr.add(expr.var("G"), expr.num(1))),
          G: parameter(expr.add(expr.var("A"), expr.num(1))),
        },
      }),
    ).toThrow(CompileModelError);
  });
});
