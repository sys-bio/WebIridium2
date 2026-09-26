import { expect, test } from "vitest";
import { compileSbml } from "../compile";
import type { IridiumModel } from "../../ir/model";
import { expr, model, parameter, reaction, species } from "../../ir/dsl";

import defaultModel from "./timeCourses/default.xml?raw";

const expectModel = (sbml: string, expected: IridiumModel) => {
  const got = compileSbml(sbml);
  expect(got).toEqual(expected);
};

test("test", () => {
  expectModel(
    defaultModel,
    model({
      variables: {
        default_compartment: parameter(1),
        A: species(10),
        B: species(0),
        C: species(0),
        k1: parameter(0.35),
        k2: parameter(0.2),
      },
      reactions: {
        _J0: reaction(
          { A: 1 },
          { B: 1 },
          expr.builtinCall("times", [expr.var("k1"), expr.var("A")]),
        ),
        _J1: reaction(
          { B: 1 },
          { C: 1 },
          expr.builtinCall("times", [expr.var("k2"), expr.var("B")]),
        ),
      },
      compartments: {
        default_compartment: ["A", "B", "C"],
      },
    }),
  );
});
