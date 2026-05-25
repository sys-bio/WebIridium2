import { it, expect, describe } from "vitest";
import { deriveModels } from "../semantic/semantic";

import {
  model,
  species,
  parameter,
  reaction,
  compartment,
  type TestModel,
} from "./modelDsl.ts";

import defaultModel from "@/assets/default.ant?raw";

const expectModels = (code: string, models: TestModel[]): void => {
  const derived = deriveModels(code);

  expect(derived).toHaveLength(models.length);

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    if (model.variables) {
      expect(Object.fromEntries(derived[i].variables)).toMatchObject(
        model.variables,
      );
    }
    if (model.reactions) {
      expect(Object.fromEntries(derived[i].reactions)).toMatchObject(
        model.reactions,
      );
    }
  }
};

const expectModel = (code: string, model: TestModel): void => {
  expectModels(code, [model]);
};

it("should derive reactions and parameters for default model", () => {
  expectModel(
    defaultModel,
    model({
      variables: {
        A: species("10"),
        B: species("0"),
        C: species("0"),
        k1: parameter("0.35"),
        k2: parameter("0.2"),
      },
      reactions: {
        _J0: reaction({ A: 1 }, { B: 1 }, "k1*A"),
        _J1: reaction({ B: 1 }, { C: 1 }, "k2*B"),
      },
    }),
  );
});

describe("declarations", () => {
  it("should add variables", () => {
    expectModel(
      "species A, B, C",
      model({
        variables: {
          A: species(),
          B: species(),
          C: species(),
        },
      }),
    );
  });

  it("should make variables const", () => {
    expectModel(
      "const species A, B\nspecies C",
      model({
        variables: {
          A: species.const(),
          B: species.const(),
          C: species(),
        },
      }),
    );
  });

  it("should derive variable kind", () => {
    expectModel(
      "const species A;var B;compartment C",
      model({
        variables: {
          A: species.const(),
          B: parameter(),
          C: compartment(),
        },
      }),
    );
  });
});
