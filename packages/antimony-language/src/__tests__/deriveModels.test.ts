import { it, expect } from "vitest";
import { deriveModels } from "../semantic/semantic";

import defaultModel from "@/assets/default.ant?raw";

it("should derive reactions and parameters", () => {
  const models = deriveModels(defaultModel);

  expect(models).toHaveLength(1);

  const variables = Object.fromEntries(models[0].variables);

  expect(variables).toMatchObject({
    A: {
      kind: "species",
      isConst: false,
      assignment: {
        kind: "set",
        formula: {
          text: "10",
        },
      },
    },
    B: {
      kind: "species",
      isConst: false,
      assignment: {
        kind: "set",
        formula: {
          text: "0",
        },
      },
    },
    C: {
      kind: "species",
      isConst: false,
      assignment: {
        kind: "set",
        formula: {
          text: "0",
        },
      },
    },
    k1: {
      kind: "parameter",
      isConst: false,
      assignment: {
        kind: "set",
        formula: {
          text: "0.35",
        },
      },
    },
    k2: {
      kind: "parameter",
      isConst: false,
      assignment: {
        kind: "set",
        formula: {
          text: "0.2",
        },
      },
    },
  });

  const reactions = Object.fromEntries(models[0].reactions);

  expect(reactions).toMatchObject({
    _J0: {
      reactants: [{ name: "A", stoichiometry: 1 }],
      products: [{ name: "B", stoichiometry: 1 }],
      rate: {
        text: "k1*A",
      },
    },
    _J1: {
      reactants: [{ name: "B", stoichiometry: 1 }],
      products: [{ name: "C", stoichiometry: 1 }],
      rate: {
        text: "k2*B",
      },
    },
  });

  expect(models[0].events).toEqual([]);
});
