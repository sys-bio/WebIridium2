import { it, expect, describe } from "vitest";
import { deriveModels } from "../semantic/semantic";

import {
  model,
  species,
  parameter,
  reaction,
  compartment,
  type TestModel,
  variables,
  event,
} from "./modelDsl.ts";

import defaultModel from "@/assets/default.ant?raw";
import { ParserRuleContext } from "antlr4ts";
import { SemanticError } from "../errors.ts";

/**
 * Strip parse contexts only to their text value. Otherwise
 * Vitest will explode when it toMatchObject on the contexts.
 */
const stripContextsOnlyToText = (
  obj: Record<string, unknown> | unknown[],
): object => {
  if (obj instanceof ParserRuleContext) {
    return {
      text: obj.text,
    };
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (
        Array.isArray(obj[i]) ||
        (typeof obj[i] === "object" && obj[i] !== null)
      ) {
        obj[i] = stripContextsOnlyToText(obj[i] as Record<string, unknown>);
      }
    }
  } else {
    for (const key in obj) {
      if (
        Array.isArray(key) ||
        (typeof obj[key] === "object" && obj[key] !== null)
      ) {
        obj[key] = stripContextsOnlyToText(obj[key] as Record<string, unknown>);
      }
    }
  }

  return obj;
};

const expectModels = (code: string, models: TestModel[]): void => {
  const derived = deriveModels(code);

  expect(derived).toHaveLength(models.length);

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    if (model.variables) {
      expect(
        stripContextsOnlyToText(Object.fromEntries(derived[i].variables)),
      ).toMatchObject(model.variables);
    }

    if (model.reactions) {
      expect(
        stripContextsOnlyToText(Object.fromEntries(derived[i].reactions)),
      ).toMatchObject(model.reactions);
    }

    if (model.events) {
      expect(
        stripContextsOnlyToText(
          Object.fromEntries(
            Array.from(derived[i].events.entries()).map(([name, event]) => [
              name,
              {
                ...event,
                assignments: Object.fromEntries(event.assignments),
              },
            ]),
          ),
        ),
      ).toMatchObject(model.events);
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

describe("diagnostics mode", () => {
  it("should collect diagnostics", () => {
    const diagnostics: Error[] = [];
    expect(diagnostics).toHaveLength(0);
    deriveModels("A := 3; A = 3", { diagnostics });
    expect(diagnostics).toHaveLength(1);
  });
});

describe("assignments", () => {
  it("should set initial assignment", () => {
    expectModel(
      "A = 5",
      variables({
        A: parameter("5"),
      }),
    );
  });

  it("should use latest assignment", () => {
    expectModel(
      "A = 3;A=5;A=4",
      variables({
        A: parameter("4"),
      }),
    );
  });

  it("should set rate assignment", () => {
    expectModel(
      "A' = 5",
      variables({
        A: parameter.rate(undefined, "5"),
      }),
    );
  });

  it("should set rate and initial assignment", () => {
    expectModel(
      "A' = Z\nA = 3",
      variables({
        A: parameter.rate("3", "Z"),
      }),
    );
  });

  it("should set rate and initial assignment with declaration", () => {
    expectModel(
      "species A' = Z\nA = 3",
      variables({
        A: species.rate("3", "Z"),
      }),
    );
  });

  it("should inherit initial assignment when setting rate", () => {
    expectModel(
      "A = Z\nA '= 3",
      variables({
        A: parameter.rate("Z", "3"),
      }),
    );
  });

  it("should inherit initial assignment when setting rate with declaration", () => {
    expectModel(
      "species A = Z\nA '= 3",
      variables({
        A: species.rate("Z", "3"),
      }),
    );
  });

  it("should set rule assignment", () => {
    expectModel(
      "A := 5*time",
      variables({
        A: parameter.rule("5*time"),
      }),
    );
  });

  it("should error when trying to set rate then rule", () => {
    expect(() => {
      deriveModels("A'=5; A:=5");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to set rule then rate", () => {
    expect(() => {
      deriveModels("A:=5; A'=5");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to set rule then initial", () => {
    expect(() => {
      deriveModels("A:=5; A=5");
    }).toThrowError(SemanticError);
  });

  it("should not error when trying to set initial then rule", () => {
    expect(() => {
      deriveModels("A=5; A:=5");
    }).not.toThrowError(SemanticError);
  });
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

  it("should assign", () => {
    expectModel(
      "const species A = 5",
      model({
        variables: {
          A: species.const("5"),
        },
      }),
    );
  });

  it("should update on assignment", () => {
    expectModel(
      "A = 0; const species A = 5",
      model({
        variables: {
          A: species.const("5"),
        },
      }),
    );
  });

  it("should let you update parameter to compartment", () => {
    expectModel(
      "A = 0; const compartment A = 5",
      model({
        variables: {
          A: compartment.const("5"),
        },
      }),
    );
  });

  it("should not let you update species to compartment", () => {
    expect(() => {
      deriveModels("species A = 0; const compartment A = 5");
    }).toThrow();
  });
});

describe("$ modifier", () => {
  it("should set const to true", () => {
    expectModel(
      "species A;$A ->;;A=5",
      variables({
        A: species.const(),
      }),
    );
  });
});

describe("events", () => {
  it("should add basic events", () => {
    expectModel(
      "at time > 5: A = 5\nat A > B: B = A",
      model({
        events: {
          _E0: event("time>5", { A: "5" }),
          _E1: event("A>B", { B: "A" }),
        },
      }),
    );
  });

  it("should add delays", () => {
    expectModel(
      "at 5 after time > 5: A = 5",
      model({
        events: { _E0: event("time>5", { delay: "5" }, { A: "5" }) },
      }),
    );
  });

  it("should add options", () => {
    expectModel(
      "at 5 after time > 5, priority=234, t0=34: A = 5",
      model({
        events: {
          _E0: event(
            "time>5",
            { delay: "5", priority: "234", t0: "34" },
            { A: "5" },
          ),
        },
      }),
    );
  });

  it("should error for invalid option", () => {
    expect(() => {
      deriveModels("at 5, t = false: A = 0");
    }).toThrow();
  });
});

describe("compartments", () => {
  it("should add to compartment in assignment", () => {
    expectModel(
      "A in C = 3",
      variables({
        A: parameter("3").in("C"),
        C: compartment(),
      }),
    );
  });

  it("should add to compartment in declaration", () => {
    expectModel(
      "species A in C, B in C",
      variables({
        A: species().in("C"),
        B: species().in("C"),
        C: compartment(),
      }),
    );
  });

  it("should be able to set reaction compartment", () => {
    expectModel(
      "J in comp: A -> B; k1",
      model({
        variables: {
          A: species(),
          B: species(),
          k1: parameter(),
        },
        reactions: {
          J: reaction({ A: 1 }, { B: 1 }, "k1", {
            compartment: "comp",
          }),
        },
      }),
    );
  });

  it("should be able to set reaction compartment", () => {
    expectModel(
      "J in comp: A -> B; k1",
      model({
        variables: {
          A: species(),
          B: species(),
          k1: parameter(),
        },
        reactions: {
          J: reaction({ A: 1 }, { B: 1 }, "k1", {
            compartment: "comp",
          }),
        },
      }),
    );
  });

  it("should be able to set reaction compartment at end", () => {
    expectModel(
      "J: A -> B; k1 in comp",
      model({
        variables: {
          A: species(),
          B: species(),
          k1: parameter(),
        },
        reactions: {
          J: reaction({ A: 1 }, { B: 1 }, "k1", {
            compartment: "comp",
          }),
        },
      }),
    );
  });

  it("should inherit reaction compartment", () => {
    expectModel(
      "J in comp: A -> B; k1",
      model({
        variables: {
          A: species().in("comp"),
          B: species().in("comp"),
          k1: parameter(),
        },
        reactions: {
          J: reaction({ A: 1 }, { B: 1 }, "k1", {
            compartment: "comp",
          }),
        },
      }),
    );
  });

  it("should inherit last reaction compartment", () => {
    expectModel(
      "J in comp: A -> B; k1\n" + "J2: A -> ; k2 in comp2",
      model({
        variables: {
          A: species().in("comp2"),
          B: species().in("comp"),
          k1: parameter(),
        },
        reactions: {
          J: reaction({ A: 1 }, { B: 1 }, "k1", {
            compartment: "comp",
          }),
          J2: reaction({ A: 1 }, {}, "k2", {
            compartment: "comp2",
          }),
        },
      }),
    );
  });

  it("should not set compartment from reaction if none", () => {
    expectModel(
      "species A in comp, B in comp; J: A -> B; k1",
      model({
        variables: {
          A: species().in("comp"),
          B: species().in("comp"),
          k1: parameter(),
        },
        reactions: {
          J: reaction({ A: 1 }, { B: 1 }, "k1", {
            compartment: null,
          }),
        },
      }),
    );
  });
});
