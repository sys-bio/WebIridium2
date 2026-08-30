import { it, expect, describe } from "vitest";
import {
  buildAntimonyDocument,
  type AntimonyModel,
} from "../../semantic/semantic";

import {
  model,
  species,
  parameter,
  reaction,
  compartment,
  type TestModel,
  event,
  renameLink,
} from "./modelDsl.ts";

import defaultModel from "@/assets/default.ant?raw";
import { ParserRuleContext } from "antlr4ts";
import { SemanticError } from "../../errors.ts";
import { DEFAULT_MODEL_NAME } from "../BuildAntimonyListener.ts";
import { rename } from "fs";

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
      // dumb hack so it doesn't walk back up when iterating through an AntimonyModel
      if (key === "parent") continue;

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

const convertModelMapsToObjects = (model: AntimonyModel): void => {
  for (const object of [...model.objects.values(), ...model.unnamedImports]) {
    if (object.kind === "model") {
      convertModelMapsToObjects(object);
    } else if (object.kind === "event") {
      // eslint-disable-next-line
      (object as any).assignments = Object.fromEntries(
        Array.from(object.assignments.entries()).map(([reference, value]) => [
          reference.join("."),
          value,
        ]),
      );
    }
  }
  // eslint-disable-next-line
  (model as any).objects = Object.fromEntries(model.objects);
};

const expectDocument = (
  code: string,
  expectedDocument: {
    models: Record<string, TestModel>;
    exportedModel: string;
  },
): void => {
  const gotDocument = buildAntimonyDocument(code);

  expect(gotDocument.exportedModel).toBe(expectedDocument.exportedModel);

  // check the root model
  for (const [name, expectedModel] of Object.entries(expectedDocument.models)) {
    const gotModel = gotDocument.models.get(name);

    expect(gotModel).not.toBeUndefined();

    convertModelMapsToObjects(gotModel!);

    expect(
      // eslint-disable-next-line
      stripContextsOnlyToText(gotModel!.objects as any),
    ).toMatchObject(expectedModel.objects);

    if (expectedModel.unnamedImports) {
      expect(stripContextsOnlyToText(gotModel!.unnamedImports)).toMatchObject(
        expectedModel.unnamedImports,
      );
    }

    if (expectedModel.exports) {
      expect(gotModel!.exports).toMatchObject(expectedModel.exports);
    }
  }
};

const expectModel = (code: string, model: TestModel): void => {
  expectDocument(code, {
    models: { [DEFAULT_MODEL_NAME]: model },
    exportedModel: DEFAULT_MODEL_NAME,
  });
};

it("should build reactions and parameters for default model", () => {
  expectModel(
    defaultModel,
    model({
      A: species("10"),
      B: species("0"),
      C: species("0"),
      k1: parameter("0.35"),
      k2: parameter("0.2"),
      _J0: reaction({ A: null }, { B: null }, "k1*A"),
      _J1: reaction({ B: null }, { C: null }, "k2*B"),
    }),
  );
});

describe("diagnostics mode", () => {
  it("should collect diagnostics", () => {
    const diagnostics: Error[] = [];
    expect(diagnostics).toHaveLength(0);
    buildAntimonyDocument("A := 3; A = 3", { diagnostics });
    expect(diagnostics).toHaveLength(1);
  });
});

describe("assignments", () => {
  it("should set initial assignment", () => {
    expectModel(
      "A = 5",
      model({
        A: parameter("5"),
      }),
    );
  });

  it("should use latest assignment", () => {
    expectModel(
      "A = 3;A=5;A=4",
      model({
        A: parameter("4"),
      }),
    );
  });

  it("should set rate assignment", () => {
    expectModel(
      "A' = 5",
      model({
        A: parameter.rate(undefined, "5"),
      }),
    );
  });

  it("should set rate and initial assignment", () => {
    expectModel(
      "A' = Z\nA = 3",
      model({
        A: parameter.rate("3", "Z"),
      }),
    );
  });

  it("should set rate and initial assignment with declaration", () => {
    expectModel(
      "species A' = Z\nA = 3",
      model({
        A: species.rate("3", "Z"),
      }),
    );
  });

  it("should inherit initial assignment when setting rate", () => {
    expectModel(
      "A = Z\nA '= 3",
      model({
        A: parameter.rate("Z", "3"),
      }),
    );
  });

  it("should inherit initial assignment when setting rate with declaration", () => {
    expectModel(
      "species A = Z\nA '= 3",
      model({
        A: species.rate("Z", "3"),
      }),
    );
  });

  it("should set rule assignment", () => {
    expectModel(
      "A := 5*time",
      model({
        A: parameter.rule("5*time"),
      }),
    );
  });

  it("should error when trying to set rate then rule", () => {
    expect(() => {
      buildAntimonyDocument("A'=5; A:=5");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to set rule then rate", () => {
    expect(() => {
      buildAntimonyDocument("A:=5; A'=5");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to set rule then initial", () => {
    expect(() => {
      buildAntimonyDocument("A:=5; A=5");
    }).toThrowError(SemanticError);
  });

  it("should not error when trying to set initial then rule", () => {
    expect(() => {
      buildAntimonyDocument("A=5; A:=5");
    }).not.toThrowError(SemanticError);
  });

  it("should assign trigger for events", () => {
    expectModel(
      "E: at A > 3: A = 3; E = A > 5",
      model({
        E: event("A>5", { A: "3" }),
      }),
    );
  });

  it("should assign rate for reactions", () => {
    expectModel(
      "J: A + B -> C; 3; J = 5",
      model({
        J: reaction({ A: null, B: null }, { C: null }, "5"),
      }),
    );
  });

  it("should error when trying assign to a function", () => {
    expect(() => {
      buildAntimonyDocument("function a(b); b; end; a = 3");
    }).toThrowError(SemanticError);
  });

  describe("with no rhs", () => {
    it("should delete initial assignment", () => {
      expectModel(
        "species A = 5; A = ;",
        model({
          A: species(),
        }),
      );
    });

    it("should delete initial assignment (with rule assignment)", () => {
      expectModel(
        "species A = 5; A := ;",
        model({
          A: species(),
        }),
      );
    });

    it("should delete rate assignment when there is no one", () => {
      expectModel(
        "species A = 5; A '= ;",
        model({
          A: species(),
        }),
      );
    });

    it("should delete rate assignment", () => {
      expectModel(
        "species A = 5; A '= 10; A '= ;",
        model({
          A: species("5"),
        }),
      );
    });

    it("should delete initial value of rate assignment", () => {
      expectModel(
        "species A = 5; A '= 10; A = ;",
        model({
          A: species.rate(undefined, "10"),
        }),
      );
    });

    it("should error when trying to delete rule assignment with empty initial", () => {
      expect(() => {
        buildAntimonyDocument("species A := 5; A = ;");
      }).toThrowError(SemanticError);
    });
  });
});

describe("declarations", () => {
  it("should add variables", () => {
    expectModel(
      "species A, B, C",
      model({
        A: species(),
        B: species(),
        C: species(),
      }),
    );
  });

  it("should make variables const", () => {
    expectModel(
      "const species A, B\nspecies C",
      model({
        A: species.const(),
        B: species.const(),
        C: species(),
      }),
    );
  });

  it("should derive variable kind", () => {
    expectModel(
      "const species A;var B;compartment C",
      model({
        A: species.const(),
        B: parameter(),
        C: compartment(),
      }),
    );
  });

  it("should assign", () => {
    expectModel(
      "const species A = 5",
      model({
        A: species.const("5"),
      }),
    );
  });

  it("should skip empty assignment", () => {
    expectModel(
      "A=;",
      model({
        A: parameter(),
      }),
    );
  });

  it("should update on assignment", () => {
    expectModel(
      "A = 0; const species A = 5",
      model({
        A: species.const("5"),
      }),
    );
  });

  it("should let you update parameter to compartment", () => {
    expectModel(
      "A = 0; const compartment A = 5",
      model({
        A: compartment.const("5"),
      }),
    );
  });

  it("should not let you update species to compartment", () => {
    expect(() => {
      buildAntimonyDocument("species A = 0; const compartment A = 5");
    }).toThrowError(SemanticError);
  });

  it("should not override const if not specified", () => {
    expectModel("const A; species A", model({ A: species.const() }));
  });

  it("should override const if specified", () => {
    expectModel("const A; var species A", model({ A: species.var() }));
  });

  it("should set substanceOnly", () => {
    expectModel("substanceOnly A", model({ A: species.substanceOnly() }));
  });

  it("should set substanceOnly with species and const", () => {
    expectModel(
      "const substanceOnly species A",
      model({ A: species.substanceOnly.const() }),
    );
  });

  it("should not allow substanceOnly on compartment", () => {
    expect(() => {
      buildAntimonyDocument("substanceOnly compartment A");
    }).toThrowError(SemanticError);
  });

  it("should forbid declaring built-in constant", () => {
    expect(() => {
      buildAntimonyDocument("species true");
    }).toThrowError(SemanticError);
  });

  it("should forbid declaring built-in function", () => {
    expect(() => {
      buildAntimonyDocument("species piecewise");
    }).toThrowError(SemanticError);
  });

  it("should allow const events and reactions with no effect", () => {
    expectModel(
      "E: at A > 3: A = 3; J: A + B -> C; 1; const E, A",
      model({
        E: event("A>3", { A: "3" }),
        J: reaction({ A: null, B: null }, { C: null }, "1"),
      }),
    );
  });

  it("should not allow substanceOnly events and reactions", () => {
    expect(() =>
      buildAntimonyDocument(
        "E: at A > 3: A = 3; J: A + B -> C; 1; substanceOnly E, A",
      ),
    ).toThrowError(SemanticError);
  });

  it("should not allow converting events or reactions to species", () => {
    expect(() =>
      buildAntimonyDocument(
        "E: at A > 3: A = 3; J: A + B -> C; 1; species E, A",
      ),
    ).toThrowError(SemanticError);
  });

  it("should not allow converting events or reactions to compartments", () => {
    expect(() =>
      buildAntimonyDocument(
        "E: at A > 3: A = 3; J: A + B -> C; 1; compartment E, A",
      ),
    ).toThrowError(SemanticError);
  });

  it("should not allow rate assignments on reactions", () => {
    expect(() =>
      buildAntimonyDocument("J: A + B -> C; k1; J' = 3"),
    ).toThrowError(SemanticError);
  });

  it("should not allow rate assignments on events", () => {
    expect(() =>
      buildAntimonyDocument("E: at time > 3: A = 3; E' = 3"),
    ).toThrowError(SemanticError);
  });

  it("should not allow assignment rules on reactions", () => {
    expect(() =>
      buildAntimonyDocument("J: A + B -> C; k1; J := 3"),
    ).toThrowError(SemanticError);
  });
});

describe("$ modifier", () => {
  it("should set const to true", () => {
    expectModel(
      "species A;$A ->;;A=5",
      model({
        A: species.const(),
      }),
    );
  });
});

describe("reactions", () => {
  it("should derive numeric stoichiometries", () => {
    expectModel(
      "2 A + 2 B -> 2 C; k1",
      model({
        A: species(),
        B: species(),
        C: species(),
        k1: parameter(),
        _J0: reaction({ A: 2, B: 2 }, { C: 2 }, "k1"),
      }),
    );
  });

  it("should derive variable stoichiometries", () => {
    expectModel(
      "n1 A + n2 B -> n3 C; k1",
      model({
        A: species(),
        B: species(),
        C: species(),
        n1: parameter(),
        n2: parameter(),
        n3: parameter(),
        k1: parameter(),
        _J0: reaction({ A: "n1", B: "n2" }, { C: "n3" }, "k1"),
      }),
    );
  });

  it("should error when trying to overwrite a parameter with a non-initial assignment", () => {
    // this is a little more restrictive then the original Antimony which only errors
    // for rate rules.
    expect(() => {
      buildAntimonyDocument("A := 5; A: ->;");
    }).toThrowError(SemanticError);

    expect(() => {
      buildAntimonyDocument("A' = 5; A: ->;");
    }).toThrowError(SemanticError);
  });

  it("should not error when trying to overwrite a parameter with initial assignment", () => {
    expectModel(
      "A = 100; A: -> ;",
      model({
        A: reaction({}, {}),
      }),
    );
  });
});

describe("events", () => {
  it("should add basic events", () => {
    expectModel(
      "at time > 5: A = 5\nat A > B: B = A",
      model({
        _E0: event("time>5", { A: "5" }),
        _E1: event("A>B", { B: "A" }),
      }),
    );
  });

  it("should add delays", () => {
    expectModel(
      "at 5 after time > 5: A = 5",
      model({
        _E0: event("time>5", { delay: "5" }, { A: "5" }),
      }),
    );
  });

  it("should add options", () => {
    expectModel(
      "at 5 after time > 5, priority=234, t0=34: A = 5",
      model({
        _E0: event(
          "time>5",
          { delay: "5", priority: "234", t0: "34" },
          { A: "5" },
        ),
      }),
    );
  });

  it("should error for invalid option", () => {
    expect(() => {
      buildAntimonyDocument("at 5, t = false: A = 0");
    }).toThrowError(SemanticError);
  });

  it("should error when using reaction in event assignment", () => {
    expect(() => {
      buildAntimonyDocument("J: A + B -> C; k1; E: at time > 5: J = 5");
    }).toThrowError(SemanticError);
  });

  it("should error when using event in event assignment", () => {
    expect(() => {
      buildAntimonyDocument("E1: at time > 5: A = 10; E2: at time > 5: E1 = 5");
    }).toThrowError(SemanticError);
  });

  it("should error when using submodel in event assignment", () => {
    expect(() => {
      buildAntimonyDocument(
        "model test; A = 5; end; sub: test(); E: at time > 5: sub = 5",
      );
    }).toThrowError(SemanticError);
  });

  it("should error when trying to overwrite a reaction with an event", () => {
    expect(() => {
      buildAntimonyDocument("J: A + B -> C; k1; J: at time > 5: A = 5");
    }).toThrowError(SemanticError);
  });
});

describe("subvariable name labels", () => {
  it("should update existing reaction in submodel", () => {
    expectModel(
      "model test; J: A + B -> C; k1; end; sub: test(); sub.J: D + E -> F; k2",
      model({
        sub: model({
          A: species(),
          B: species(),
          C: species(),
          J: reaction({ D: null, E: null }, { F: null }, "k2"),
        }),
      }),
    );
  });

  it("should update existing event in submodel", () => {
    expectModel(
      "model test; E: at time > 5: A = 5; end; sub: test(); sub.E: at time > 5: B = 5",
      model({
        sub: model({
          A: parameter(),
          E: event("time>5", { B: "5" }),
        }),
      }),
    );
  });

  it("should error when trying to update non-existent object in submodel", () => {
    expect(() => {
      buildAntimonyDocument(
        "model A; C = 5; end; sub: A(); sub.D: A + B -> C; k1",
      );
    }).toThrowError(SemanticError);
  });

  it("should error when trying to update objects of different types", () => {
    expect(() => {
      buildAntimonyDocument(
        "model A; species C = 5; end; sub: A(); sub.C: A + B -> C; k1",
      );
    }).toThrowError(SemanticError);
  });
});

describe("compartments", () => {
  it("should add to compartment in assignment", () => {
    expectModel(
      "A in C = 3",
      model({
        A: parameter("3").in("C"),
        C: compartment(),
      }),
    );
  });

  it("should add to compartment in declaration", () => {
    expectModel(
      "species A in C, B in C",
      model({
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
        A: species(),
        B: species(),
        k1: parameter(),
        J: reaction({ A: null }, { B: null }, "k1").in("comp"),
      }),
    );
  });

  it("should be able to set reaction compartment", () => {
    expectModel(
      "J in comp: A -> B; k1",
      model({
        A: species(),
        B: species(),
        k1: parameter(),
        J: reaction({ A: null }, { B: null }, "k1").in("comp"),
      }),
    );
  });

  it("should be able to set reaction compartment at end", () => {
    expectModel(
      "J: A -> B; k1 in comp",
      model({
        A: species(),
        B: species(),
        k1: parameter(),
        J: reaction({ A: null }, { B: null }, "k1").in("comp"),
      }),
    );
  });

  it("should inherit reaction compartment", () => {
    expectModel(
      "J in comp: A -> B; k1",
      model({
        A: species().in("comp"),
        B: species().in("comp"),
        k1: parameter(),
        J: reaction({ A: null }, { B: null }, "k1").in("comp"),
      }),
    );
  });

  it("should inherit last reaction compartment", () => {
    expectModel(
      "J in comp: A -> B; k1\n" + "J2: A -> ; k2 in comp2",
      model({
        A: species().in("comp2"),
        B: species().in("comp"),
        k1: parameter(),
        J: reaction({ A: null }, { B: null }, "k1").in("comp"),
        J2: reaction({ A: null }, {}, "k2").in("comp2"),
      }),
    );
  });

  it("should not set compartment from reaction if none", () => {
    expectModel(
      "species A in comp, B in comp; J: A -> B; k1",
      model({
        A: species().in("comp"),
        B: species().in("comp"),
        k1: parameter(),
        J: reaction({ A: null }, { B: null }, "k1"),
      }),
    );
  });

  it("should set compartment with in statement", () => {
    expectModel(
      "A in comp",
      model({
        A: parameter().in("comp"),
      }),
    );
  });

  it("should not let you set built-in compartment", () => {
    expect(() => {
      buildAntimonyDocument("true in comp");
    }).toThrowError(SemanticError);
  });
});

describe("model", () => {
  it("should export the last one if the top-level model is empty", () => {
    expectDocument("model a(); A = 3; end; model test(); A = 3; end", {
      models: {
        [DEFAULT_MODEL_NAME]: model({}),
        a: model({ A: parameter("3") }),
        test: model({ A: parameter("3") }),
      },
      exportedModel: "test",
    });
  });

  it("should export the top-level if none are specified and it is not empty", () => {
    expectDocument("model a(); A = 3; end; model test(); A = 3; end; A = 3", {
      models: {
        [DEFAULT_MODEL_NAME]: model({}),
        a: model({ A: parameter("3") }),
        test: model({ A: parameter("3") }),
      },
      exportedModel: DEFAULT_MODEL_NAME,
    });
  });

  it("should export whichever is specified", () => {
    expectDocument("model *a(); A = 3; end; model test(); A = 3; end; A = 3", {
      models: {
        [DEFAULT_MODEL_NAME]: model({}),
        a: model({ A: parameter("3") }),
        test: model({ A: parameter("3") }),
      },
      exportedModel: "a",
    });
  });

  it("should export the last specified", () => {
    expectDocument("model *a(); A = 3; end; model *test(); A = 3; end; A = 3", {
      models: {
        [DEFAULT_MODEL_NAME]: model({}),
        a: model({ A: parameter("3") }),
        test: model({ A: parameter("3") }),
      },
      exportedModel: "test",
    });
  });
});

describe("model imports", () => {
  const exampleModelString = "model example(); S + E -> ES;; end";
  const exampleModel = (
    referencePrefix?: string,
    merge?: Record<string, unknown>,
    unnamedImports?: unknown[],
  ) =>
    model(
      {
        S: species(),
        E: species(),
        ES: species(),
        _J0: reaction(
          {
            [referencePrefix ? referencePrefix + ".S" : "S"]: null,
            [referencePrefix ? referencePrefix + ".E" : "E"]: null,
          },
          {
            [referencePrefix ? referencePrefix + ".ES" : "ES"]: null,
          },
        ),
        ...merge,
      },
      unnamedImports,
    );

  it("should import simple model", () => {
    expectDocument(`${exampleModelString}; example();`, {
      models: {
        [DEFAULT_MODEL_NAME]: model({}, [exampleModel("0")]),
        example: exampleModel(),
      },
      exportedModel: DEFAULT_MODEL_NAME,
    });
  });

  it("should import multiple models", () => {
    expectDocument(`${exampleModelString}; example(); example(); example();`, {
      models: {
        [DEFAULT_MODEL_NAME]: model({}, [
          exampleModel("0"),
          exampleModel("1"),
          exampleModel("2"),
        ]),
        example: exampleModel(),
      },
      exportedModel: DEFAULT_MODEL_NAME,
    });
  });

  it("should import named models", () => {
    expectDocument(`${exampleModelString}; A: example(); B: example()`, {
      models: {
        [DEFAULT_MODEL_NAME]: model(
          { A: exampleModel("A"), B: exampleModel("B") },
          [],
        ),
        example: exampleModel(),
      },
      exportedModel: DEFAULT_MODEL_NAME,
    });
  });

  it("should import named and unnamed models", () => {
    expectDocument(
      `${exampleModelString}; A: example(); B: example(); example()`,
      {
        models: {
          [DEFAULT_MODEL_NAME]: model(
            { A: exampleModel("A"), B: exampleModel("B") },
            [exampleModel("0")],
          ),
          example: exampleModel(),
        },
        exportedModel: DEFAULT_MODEL_NAME,
      },
    );
  });

  it("should import unnamed nested models", () => {
    expectDocument(
      `${exampleModelString}; model example2(); example(); end; example2(); example()`,
      {
        models: {
          [DEFAULT_MODEL_NAME]: model({}, [
            model({}, [exampleModel("0.0")]),
            exampleModel("1"),
          ]),
          example: exampleModel(),
          example2: model({}, [exampleModel("0")]),
        },
        exportedModel: DEFAULT_MODEL_NAME,
      },
    );
  });

  it("should import named nested models", () => {
    expectDocument(
      `${exampleModelString}; model example2(); A: example(); end; A: example2(); B: example()`,
      {
        models: {
          [DEFAULT_MODEL_NAME]: model({
            A: model({ A: exampleModel("A.A") }),
            B: exampleModel("B"),
          }),
          example: exampleModel(),
          example2: model({ A: exampleModel("A") }),
        },
        exportedModel: DEFAULT_MODEL_NAME,
      },
    );
  });

  it("should error when trying to import with a name already owned by a model", () => {
    expect(() => {
      buildAntimonyDocument(
        `${exampleModelString}; model example2(); A: example(); end; A: example2(); A: example()`,
      );
    }).toThrowError(SemanticError);
  });

  it("should error when trying to import itself", () => {
    expect(() => {
      buildAntimonyDocument("model test; A: test(); end");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to import with a name already owned by a variable", () => {
    expect(() => {
      buildAntimonyDocument(`${exampleModelString}; A = 3; A: example()`);
    }).toThrowError(SemanticError);
  });

  it("should error when trying to import with a name already owned by an event", () => {
    expect(() => {
      buildAntimonyDocument(
        `${exampleModelString}; A: at time > 3: B = 0; A: example()`,
      );
    }).toThrowError(SemanticError);
  });

  it("should allow reactions between imported models", () => {
    expectDocument(
      `${exampleModelString}; A: example(); B: example(); A.E -> B.E;`,
      {
        models: {
          [DEFAULT_MODEL_NAME]: model({
            A: exampleModel("A"),
            B: exampleModel("B"),
            _J0: reaction({ "A.E": null }, { "B.E": null }),
          }),
          example: exampleModel(),
        },
        exportedModel: DEFAULT_MODEL_NAME,
      },
    );
  });

  it("should allow reactions between imported models 2", () => {
    expectDocument(
      `${exampleModelString}; A: example(); B: example(); A.E + B.E -> C;`,
      {
        models: {
          [DEFAULT_MODEL_NAME]: model({
            A: exampleModel("A"),
            B: exampleModel("B"),
            _J0: reaction({ "A.E": null, "B.E": null }, { C: null }),
          }),
          example: exampleModel(),
        },
        exportedModel: DEFAULT_MODEL_NAME,
      },
    );
  });

  it("should allow re-assigning in imported models", () => {
    expectDocument(`${exampleModelString}; A: example(); A.E = 3`, {
      models: {
        [DEFAULT_MODEL_NAME]: model({
          A: exampleModel("A", {
            E: species("3"),
          }),
        }),
        example: exampleModel(),
      },
      exportedModel: DEFAULT_MODEL_NAME,
    });
  });

  it("should not allow adding to imported models", () => {
    expect(() => {
      buildAntimonyDocument(`${exampleModelString}; A: example(); A.D = 3`);
    }).toThrowError(SemanticError);
  });

  it("should not allow adding to imported models", () => {
    expect(() => {
      buildAntimonyDocument(`${exampleModelString}; A: example(); A.D = 3`);
    }).toThrowError(SemanticError);
  });

  it("should not allow using imported models inside reactions", () => {
    expect(() => {
      buildAntimonyDocument(`${exampleModelString}; A: example(); A + B -> C;`);
    }).toThrowError(SemanticError);
  });

  describe("export list", () => {
    it("should make rename links for export list", () => {
      expectDocument(
        "model test(A, B, C) species A = 5; B = 5; C = 10; end; sub: test(A, B, C)",
        {
          models: {
            [DEFAULT_MODEL_NAME]: model({
              sub: model({
                A: renameLink("A"),
                B: renameLink("B"),
                C: renameLink("C"),
              }),
              A: species("5"),
              B: parameter("5"),
              C: parameter("10"),
            }),
            test: model(
              {
                A: species("5"),
                B: parameter("5"),
                C: parameter("10"),
              },
              [],
              ["A", "B", "C"],
            ),
          },
          exportedModel: DEFAULT_MODEL_NAME,
        },
      );
    });

    it("should make rename links for export list with no import name", () => {
      expectDocument(
        "model test(A, B, C) species A = 5; B = 5; C = 10; end; test(A, B, C)",
        {
          models: {
            [DEFAULT_MODEL_NAME]: model(
              {
                A: species("5"),
                B: parameter("5"),
                C: parameter("10"),
              },
              [
                model({
                  A: renameLink("A"),
                  B: renameLink("B"),
                  C: renameLink("C"),
                }),
              ],
            ),
            test: model(
              {
                A: species("5"),
                B: parameter("5"),
                C: parameter("10"),
              },
              [],
              ["A", "B", "C"],
            ),
          },
          exportedModel: DEFAULT_MODEL_NAME,
        },
      );
    });

    it("should make rename links for export list even when import list is shorter", () => {
      expectDocument(
        "model test(A, B, C) species A = 5; B = 5; C = 10; end; sub: test(A, B)",
        {
          models: {
            [DEFAULT_MODEL_NAME]: model({
              sub: model({
                A: renameLink("A"),
                B: renameLink("B"),
                C: parameter("10"),
              }),
              A: species("5"),
              B: parameter("5"),
            }),
            test: model(
              {
                A: species("5"),
                B: parameter("5"),
                C: parameter("10"),
              },
              [],
              ["A", "B", "C"],
            ),
          },
          exportedModel: DEFAULT_MODEL_NAME,
        },
      );
    });

    it("should make rename links for export list even with subvariables", () => {
      expectDocument(
        "model test(A, B, C) species A = 5; B = 5; C = 10; end; sub0: test(); sub1: test(sub0.A)",
        {
          models: {
            [DEFAULT_MODEL_NAME]: model({
              sub0: model({
                A: species("5"),
                B: parameter("5"),
                C: parameter("10"),
              }),
              sub1: model({
                A: renameLink("sub0.A"),
                B: parameter("5"),
                C: parameter("10"),
              }),
            }),
            test: model(
              {
                A: species("5"),
                B: parameter("5"),
                C: parameter("10"),
              },
              [],
              ["A", "B", "C"],
            ),
          },
          exportedModel: DEFAULT_MODEL_NAME,
        },
      );
    });

    it("should create variable in export list if it does not exist", () => {
      expectDocument("model test(A) B = 5; end; sub: test(C)", {
        models: {
          [DEFAULT_MODEL_NAME]: model({
            sub: model({
              A: renameLink("C"),
              B: parameter("5"),
            }),
            C: parameter(),
          }),
          test: model(
            {
              A: parameter(),
              B: parameter("5"),
            },
            [],
            ["A"],
          ),
        },
        exportedModel: DEFAULT_MODEL_NAME,
      });
    });

    it("should error when import list has more names than export list", () => {
      expect(() => {
        buildAntimonyDocument(`model test(A) A = 5; end; sub: test(A, B)`);
      }).toThrowError(SemanticError);
    });

    it("should error when export list contains subvariable", () => {
      expect(() => {
        buildAntimonyDocument(
          `model test2() B = 5; end; model test(sub.A) sub: test2(); end`,
        );
      }).toThrowError(SemanticError);
    });

    it("should error when export list contains model", () => {
      expect(() => {
        buildAntimonyDocument(
          `model test2() B = 5; end; model test(sub) sub: test2(); end`,
        );
      }).toThrowError(SemanticError);
    });

    it("should error when export list contains a built-in constant", () => {
      expect(() => {
        buildAntimonyDocument(`model test(pi); end`);
      }).toThrowError(SemanticError);
    });

    it("should error when export list contains a built-in function", () => {
      expect(() => {
        buildAntimonyDocument(`model test(sin); end`);
      }).toThrowError(SemanticError);
    });

    it("should error when export list contains a function name", () => {
      expect(() => {
        buildAntimonyDocument(`function t() 5; end; model test(t); end`);
      }).toThrowError(SemanticError);
    });
  });
});

describe("renaming", () => {
  it("should have no effect when to itself", () => {
    expectModel("A is A", model({ A: parameter() }));
  });

  it("should leave a rename link at the old name", () => {
    expectModel(
      "A is B",
      model({
        A: renameLink("B"),
        B: parameter(),
      }),
    );
  });

  it("should leave a rename link at the old name even with submodels", () => {
    expectModel(
      "model test; species A = 5; end; t: test(); t.A is B",
      model({
        t: model({
          A: renameLink("B"),
        }),
        B: species("5"),
      }),
    );

    expectModel(
      `model test2
        A + B -> C; k1
      end

      model test3
        2 A + 2 B -> 2 C; k1
      end

      model test
        sub2: test2()
        sub3: test3()

        sub2.A is sub3.B
      end

      sub: test()
      subagain: test()
      sub.sub2.B is A`,
      model({
        A: species(),
        sub: model({
          sub2: model({
            A: renameLink("sub.sub3.B"),
            B: renameLink("A"),
            C: species(),
            k1: parameter(),
            _J0: reaction(
              { "sub.sub2.A": null, "sub.sub2.B": null },
              { "sub.sub2.C": null },
              "k1",
            ),
          }),
          sub3: model({
            A: species(),
            B: species(),
            C: species(),
            k1: parameter(),
            _J0: reaction(
              { "sub.sub3.A": 2, "sub.sub3.B": 2 },
              { "sub.sub3.C": 2 },
              "k1",
            ),
          }),
        }),
        subagain: model({
          sub2: model({
            A: renameLink("subagain.sub3.B"),
            B: species(),
            C: species(),
            k1: parameter(),
            _J0: reaction(
              { "subagain.sub2.A": null, "subagain.sub2.B": null },
              { "subagain.sub2.C": null },
              "k1",
            ),
          }),
          sub3: model({
            A: species(),
            B: species(),
            C: species(),
            k1: parameter(),
            _J0: reaction(
              { "subagain.sub3.A": 2, "subagain.sub3.B": 2 },
              { "subagain.sub3.C": 2 },
              "k1",
            ),
          }),
        }),
      }),
    );
  });

  describe("conversion factors", () => {
    it("should add conversion factor to rename link", () => {
      expectModel(
        "A is B / c",
        model({
          A: renameLink("B", "c"),
          B: parameter(),
          c: parameter(),
        }),
      );
      expectModel(
        "A * c is B",
        model({
          A: renameLink("B", "c"),
          B: parameter(),
          c: parameter(),
        }),
      );
    });

    it("should error when renaming to itself with conversion factor", () => {
      expect(() => buildAntimonyDocument("A * conv is A")).toThrowError(
        SemanticError,
      );
      expect(() => buildAntimonyDocument("A is A / conv")).toThrowError(
        SemanticError,
      );
    });
  });

  it("should throw error when trying to rename model", () => {
    expect(() => {
      buildAntimonyDocument(
        "model example(); A = 3; end; A: example(); A is B",
      );
    }).toThrowError(SemanticError);
  });

  it("should throw error when trying to rename non-existent variabe in submodel", () => {
    expect(() => {
      buildAntimonyDocument(
        "model example(); A = 3; end; A: example(); A.fake is B",
      );
    }).toThrowError(SemanticError);
  });

  it("should throw error when trying to rename species to existing compartment", () => {
    expect(() => {
      buildAntimonyDocument("compartment A; species B; A is B");
    }).toThrowError(SemanticError);
  });

  it("should throw error when trying to rename compartment to existing species", () => {
    expect(() => {
      buildAntimonyDocument("compartment A; species B; B is A");
    }).toThrowError(SemanticError);
  });

  describe("with existing objects", () => {
    it("should become a species if any was one", () => {
      expectModel(
        "species A; var B = 5; B is A",
        model({
          A: species("5"),
          B: renameLink("A"),
        }),
      );

      expectModel(
        "var A; species B = 5; B is A",
        model({
          A: species("5"),
          B: renameLink("A"),
        }),
      );
    });

    // Even though libantimony allows this, we are disallowing it here because
    // the behavior is very unpredictable. For example, renaming event to existing
    // variable always make the trigger true. Better to be more restrictive here
    // in my opinion.
    it("should throw error when trying to rename reaction to existing variable", () => {
      expect(() => {
        buildAntimonyDocument("J: A + B -> C; k1; D = 3; J is D");
      }).toThrowError(SemanticError);
    });

    it("should throw error when trying to rename event to existing variable", () => {
      expect(() => {
        buildAntimonyDocument("E: at time > 3: D = 3; E is D");
      }).toThrowError(SemanticError);
    });

    it("should throw error when trying to rename event to existing reaction", () => {
      expect(() => {
        buildAntimonyDocument(
          "E: at time > 3: A = 3; J: A + B -> C; k1; E is J",
        );
      }).toThrowError(SemanticError);
    });
  });
});

describe("deleting", () => {
  it("should mark variables as deleted", () => {
    expectModel(
      "model test; species A = 5; end; sub: test(); delete sub.A",
      model({
        sub: model({
          A: species("5").deleted(),
        }),
      }),
    );
  });

  it("should mark events as deleted", () => {
    expectModel(
      "model test; E: at time > 5: A = 3; end; sub: test(); delete sub.E",
      model({
        sub: model({
          A: parameter(),
          E: event("time>5", { "sub.A": "3" }).deleted(),
        }),
      }),
    );
  });

  it("should mark reactions as deleted", () => {
    expectModel(
      "model test; J: A + B -> C; k1; end; sub: test(); delete sub.J",
      model({
        sub: model({
          A: species(),
          B: species(),
          C: species(),
          J: reaction(
            { "sub.A": null, "sub.B": null },
            { "sub.C": null },
            "k1",
          ).deleted(),
        }),
      }),
    );
  });

  it("should error when trying to delete variable not in submodel", () => {
    expect(() => {
      buildAntimonyDocument("A = 5; delete A");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to delete non-existent variable in submodel", () => {
    expect(() => {
      buildAntimonyDocument(
        "model test(); A = 5; end; sub: test(); delete sub.fake",
      );
    }).toThrowError(SemanticError);
  });

  it("should error when trying to delete reaction not in submodel", () => {
    expect(() => {
      buildAntimonyDocument("J: A + B -> C; k1; delete J");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to delete event not in submodel", () => {
    expect(() => {
      buildAntimonyDocument("E: at time > 3: A = 5; delete E");
    }).toThrowError(SemanticError);
  });

  it("should error when trying to delete submodel", () => {
    expect(() => {
      buildAntimonyDocument("model test; A = 5; end; sub: test(); delete test");
    }).toThrowError(SemanticError);
  });
});

describe("annotations", () => {
  it("should set displayName", () => {
    expectModel(
      'species A; A is "dog"',
      model({ A: species().display("dog") }),
    );
  });

  it("should not allow multiple strings in `is`", () => {
    expect(() => {
      buildAntimonyDocument('species A; A is "dog", "cat"');
    }).toThrowError(SemanticError);
  });
});
