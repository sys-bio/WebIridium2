import { describe, it, expect } from "vitest";
import { compileIntermediate, type IridiumModel } from "iridium-simulator";
import {
  event,
  expr,
  model,
  species,
  parameter,
  reaction,
  type DslVariable,
} from "iridium-simulator/dsl";
import { CompileError } from "../../errors";
import { deriveModels } from "../../semantic/semantic";
import { compileToIridium } from "../../compile/compile";
import defaultModel from "../../__tests__/results/substanceOnly_initial.ant?raw";
import { writeFileSync } from "node:fs";

// enable this to write a `defaultModel.wasm` file wherever you are.
// useful to use with WABT to analyze the WebAssembly output.
const WRITE_BASIC_MODEL = true;

const variables = (variables: {
  [name: string]: DslVariable;
}): IridiumModel => {
  return model({ variables });
};

// We need to delete the metadata since vitest will explode when trying to toMatchObject with it
const deleteMetadata = (obj: Record<string, unknown>): void => {
  for (const key in obj) {
    if (key === "metadata") {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      deleteMetadata(obj[key] as Record<string, unknown>);
    }
  }
};

const deleteMetadataFromArray = (arr: Record<string, unknown>[]): void => {
  for (const obj of arr) {
    deleteMetadata(obj);
  }
};

const compileToIr = (source: string): IridiumModel => {
  const antimony = deriveModels(source);
  const iridium = compileToIridium(antimony);
  return iridium;
};

const expectCompilesTo = (source: string, expected: IridiumModel): void => {
  deleteMetadataFromArray(expected.variables);
  deleteMetadataFromArray(expected.reactions);
  deleteMetadataFromArray(expected.events);

  const got = compileToIr(source);

  deleteMetadataFromArray(got.variables);
  deleteMetadataFromArray(got.reactions);
  deleteMetadataFromArray(got.events);

  const gotNames = {
    variables: Object.fromEntries(got.variables.map((v) => [v.name, v])),
    reactions: Object.fromEntries(got.reactions.map((v) => [v.name, v])),
    events: Object.fromEntries(got.events.map((v) => [v.name, v])),
  };

  const expectedNames = {
    variables: Object.fromEntries(expected.variables.map((v) => [v.name, v])),
    reactions: Object.fromEntries(expected.reactions.map((v) => [v.name, v])),
    events: Object.fromEntries(expected.events.map((v) => [v.name, v])),
  };

  expect(gotNames).toMatchObject(expectedNames);
};

describe("ir", () => {
  it("should throw when trying to compile rate- and reaction-defined species", () => {
    expect(() => {
      compileToIr("species A; A' = 5; A -> B; 3");
    }).toThrowError(CompileError);
  });

  describe("formulas", () => {
    it("should compile addition", () => {
      expectCompilesTo(
        "A = 123 + 246",
        variables({
          A: parameter(expr.add(expr.num(123), expr.num(246))),
        }),
      );
    });

    it("should compile subtraction", () => {
      expectCompilesTo(
        "A = 123 - 246",
        variables({
          A: parameter(expr.sub(expr.num(123), expr.num(246))),
        }),
      );
    });

    it("should multiplication, division, mod", () => {
      expectCompilesTo(
        "A = 123 * 123 / 123 % 123",
        variables({
          A: parameter(
            expr.mod(
              expr.div(expr.mul(expr.num(123), expr.num(123)), expr.num(123)),
              expr.num(123),
            ),
          ),
        }),
      );
    });

    it("should compile power", () => {
      expectCompilesTo(
        "A = 5 ^ 3",
        variables({
          A: parameter(expr.pow(expr.num(5), expr.num(3))),
        }),
      );
    });

    it("should compile function call", () => {
      expectCompilesTo(
        "A = func(1, 2, 3)",
        variables({
          A: parameter(
            expr.call("func", [expr.num(1), expr.num(2), expr.num(3)]),
          ),
        }),
      );
    });

    it("should compile negation", () => {
      expectCompilesTo(
        "A = -A",
        variables({
          A: parameter(expr.neg(expr.var("A"))),
        }),
      );
    });

    it("should compile equallity and inequality", () => {
      expectCompilesTo(
        "A = 1 == 3 != 5",
        variables({
          A: parameter(
            expr.neq(expr.eq(expr.num(1), expr.num(3)), expr.num(5)),
          ),
        }),
      );
    });

    it("should compile comparisons and logical", () => {
      expectCompilesTo(
        "A = (1 > 3) && (2 < 5) && ((1 >= 3) || (2 <= 5))",
        variables({
          A: parameter(
            expr.and(
              expr.and(
                expr.gt(expr.num(1), expr.num(3)),
                expr.lt(expr.num(2), expr.num(5)),
              ),
              expr.or(
                expr.ge(expr.num(1), expr.num(3)),
                expr.le(expr.num(2), expr.num(5)),
              ),
            ),
          ),
        }),
      );
    });

    it("should compile complex formula", () => {
      expectCompilesTo(
        "A = f(A^3, B>=3, 5*(10+A), 10+A*3) + 10^5",
        variables({
          A: parameter(
            expr.add(
              expr.call("f", [
                expr.pow(expr.var("A"), expr.num(3)),
                expr.ge(expr.var("B"), expr.num(3)),
                expr.mul(expr.num(5), expr.add(expr.num(10), expr.var("A"))),
                expr.add(expr.num(10), expr.mul(expr.var("A"), expr.num(3))),
              ]),
              expr.pow(expr.num(10), expr.num(5)),
            ),
          ),
        }),
      );
    });
  });

  describe("models", () => {
    describe("species and parameters", () => {
      it("should compile species and reactions", () => {
        expectCompilesTo(
          "species A = 1, B = 1; J: A -> B; k1",
          model({
            variables: {
              A: species(1),
              B: species(1),
            },
            reactions: {
              J: reaction({ A: 1 }, { B: 1 }, expr.var("k1")),
            },
          }),
        );
      });

      it("should compile species as parameter if not involved in reaction", () => {
        expectCompilesTo(
          "species A, B",
          model({
            variables: {
              A: parameter(0),
              B: parameter(0),
            },
          }),
        );
      });

      it("should compile default values", () => {
        expectCompilesTo(
          "A -> B; 3",
          model({
            variables: {
              A: species(0),
              B: species(0),
            },
          }),
        );
      });
    });

    describe("compartments", () => {
      it("should compile compartments", () => {
        expectCompilesTo(
          "A = 10; C in B = 5; B = 30; A in B",
          model({
            variables: {
              A: parameter(10),
              B: parameter(30),
              C: parameter(5),
            },
            compartments: {
              B: ["A", "C"],
            },
          }),
        );
      });
    });

    describe("reactions", () => {
      it("should compile stoichiometries", () => {
        expectCompilesTo(
          "J: 100 A -> 200 B; k1",
          model({
            variables: {
              A: species(0),
              B: species(0),
            },
            reactions: {
              J: reaction({ A: 100 }, { B: 200 }, expr.var("k1")),
            },
          }),
        );
      });

      // TODO: test - is this valid behavior?
      it("should omit boundary species from reactions", () => {
        expectCompilesTo(
          "species A = 1, $B = 1; J: A -> B; k1",
          model({
            variables: {
              A: species(1),
              B: parameter(1),
            },
            reactions: {
              J: reaction({ A: 1 }, {}, expr.var("k1")),
            },
          }),
        );
      });
    });

    describe("events", () => {
      it("should compile events", () => {
        expectCompilesTo(
          "E: at A > 5: B = 3",
          model({
            variables: {
              A: parameter(0),
              B: parameter(0),
            },
            events: {
              E: event(expr.gt(expr.var("A"), expr.num(5)), {
                B: expr.num(3),
              }),
            },
          }),
        );
      });

      it("should compile events with options", () => {
        expectCompilesTo(
          "E: at A > 5, fromTrigger=false, persistent=false, t0=false: B = 3",
          model({
            variables: {
              A: parameter(0),
              B: parameter(0),
            },
            events: {
              E: event(
                expr.gt(expr.var("A"), expr.num(5)),
                {
                  B: expr.num(3),
                },
                {
                  isFromTrigger: false,
                  isPersistent: false,
                  isT0: false,
                },
              ),
            },
          }),
        );
      });
    });
  });
});

describe("wasm", () => {
  it("should compile valid WASM", () => {
    const ir = compileToIridium(deriveModels(defaultModel));
    const { bytecode } = compileIntermediate(ir);

    if (WRITE_BASIC_MODEL) {
      writeFileSync("defaultModel.wasm", bytecode);
    }

    expect(WebAssembly.validate(bytecode)).toBe(true);
  });
});
