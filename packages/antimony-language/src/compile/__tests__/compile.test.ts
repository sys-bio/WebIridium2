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
  func,
} from "iridium-simulator/dsl";
import { CompileError } from "../../errors";
import { buildAntimonyDocument } from "../../semantic/semantic";
import { compileToIridium } from "../../compile/compile";
import defaultModel from "../../__tests__/results/example_firczuk_large.ant?raw";
import { writeFileSync } from "node:fs";

// enable this to write a `defaultModel.wasm` file wherever you are.
// useful to use with WABT to analyze the WebAssembly output.
const WRITE_BASIC_MODEL = false;

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
  const document = buildAntimonyDocument(source);
  const iridium = compileToIridium(document);
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

    it("should compile equality and inequality", () => {
      expectCompilesTo(
        "A = (1 == 3) != 5",
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

    it("should compile chained operators", () => {
      expectCompilesTo(
        "A = 1 > 3 == 1 + 2 != func(B)",
        variables({
          A: parameter(
            expr.and(
              expr.and(
                expr.gt(expr.num(1), expr.num(3)),
                expr.eq(expr.num(3), expr.add(expr.num(1), expr.num(2))),
              ),
              expr.neq(
                expr.add(expr.num(1), expr.num(2)),
                expr.call("func", [expr.var("B")]),
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
    describe("variables", () => {
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
          "compartment C; A -> B; 3",
          model({
            variables: {
              A: species(0),
              B: species(0),
              C: parameter(1),
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
      it("should compile use 1 as default stoichiometry", () => {
        expectCompilesTo(
          "J: A -> B; k1",
          model({
            variables: {
              A: species(0),
              B: species(0),
            },
            reactions: {
              J: reaction({ A: 1 }, { B: 1 }, expr.var("k1")),
            },
          }),
        );
      });

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

      it("should compile variable stoichiometries", () => {
        expectCompilesTo(
          "J: X1 A + X2 B -> X3 C; k1",
          model({
            variables: {
              X1: parameter(0),
              X2: parameter(0),
              X3: parameter(0),
              k1: parameter(0),
              A: species(0),
              B: species(0),
              C: species(0),
            },
            reactions: {
              J: reaction(
                { A: expr.var("X1"), B: expr.var("X2") },
                { C: expr.var("X3") },
                expr.var("k1"),
              ),
            },
          }),
        );
      });

      it("should not think -( is its own token", () => {
        expectCompilesTo(
          "J: A -> B; -(C)",
          model({
            variables: {
              A: species(0),
              B: species(0),
              C: parameter(0),
            },
            reactions: {
              J: reaction({ A: 1 }, { B: 1 }, expr.neg(expr.var("C"))),
            },
          }),
        );
      });

      it("should use 0 as the default reaction rate", () => {
        expectCompilesTo(
          "A + B -> C; ",
          model({
            variables: {
              A: species(0),
              B: species(0),
              C: species(0),
            },
            reactions: {
              _J0: reaction({ A: 1, B: 1 }, { C: 1 }, expr.num(0)),
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

  describe("function", () => {
    it("should compile no parameters", () => {
      expectCompilesTo(
        "function test() 5 end",
        model({
          functions: {
            a: func([], expr.num(5)),
          },
        }),
      );
    });

    it("should compile 3 parameters", () => {
      expectCompilesTo(
        "function test(a, b, c) a + b + c end",
        model({
          functions: {
            a: func(
              ["a", "b", "c"],
              expr.add(expr.add(expr.var("a"), expr.var("b")), expr.var("c")),
            ),
          },
        }),
      );
    });

    it("should error when using a function name without calling it", () => {
      expect(() => {
        compileToIr("function test(a); a + a; end; C = 3 + test");
      }).toThrowError(CompileError);
    });
  });

  describe("model imports", () => {
    it("should flatten named imports", () => {
      expectCompilesTo(
        "model example; A + B -> C; k1; end; A: example(); B: example()",
        model({
          variables: {
            A__A: species(0),
            A__B: species(0),
            A__C: species(0),
            A__k1: parameter(0),
            B__A: species(0),
            B__B: species(0),
            B__C: species(0),
            B__k1: parameter(0),
          },
          reactions: {
            A___J0: reaction(
              { A__A: 1, A__B: 1 },
              { A__C: 1 },
              expr.var("A__k1"),
            ),
            B___J0: reaction(
              { B__A: 1, B__B: 1 },
              { B__C: 1 },
              expr.var("B__k1"),
            ),
          },
        }),
      );
    });

    it("should not duplicate when an import is of the same name", () => {
      expectCompilesTo(
        "model example; A + B -> C; k1; end; A: example(); A: example()",
        model({
          variables: {
            A__A: species(0),
            A__B: species(0),
            A__C: species(0),
            A__k1: parameter(0),
          },
          reactions: {
            A___J0: reaction(
              { A__A: 1, A__B: 1 },
              { A__C: 1 },
              expr.var("A__k1"),
            ),
          },
        }),
      );
    });

    it("should resolve name collisions", () => {
      expectCompilesTo(
        "A__A = 10; model example; A + B -> C; k1; end; A: example(); B: example()",
        model({
          variables: {
            A__A: parameter(10),
            A__A_0: species(0),
            A__B: species(0),
            A__C: species(0),
            A__k1: parameter(0),
            B__A: species(0),
            B__B: species(0),
            B__C: species(0),
            B__k1: parameter(0),
          },
          reactions: {
            A___J0: reaction(
              { A__A_0: 1, A__B: 1 },
              { A__C: 1 },
              expr.var("A__k1"),
            ),
            B___J0: reaction(
              { B__A: 1, B__B: 1 },
              { B__C: 1 },
              expr.var("B__k1"),
            ),
          },
        }),
      );
    });

    it("should not duplicate when an import is of the same name", () => {
      expectCompilesTo(
        "model example; A + B -> C; k1; end; A: example(); A: example()",
        model({
          variables: {
            A__A: species(0),
            A__B: species(0),
            A__C: species(0),
            A__k1: parameter(0),
          },
          reactions: {
            A___J0: reaction(
              { A__A: 1, A__B: 1 },
              { A__C: 1 },
              expr.var("A__k1"),
            ),
          },
        }),
      );
    });

    it("should error when using imported model name inside formula", () => {
      expect(() => {
        compileToIr("model test; A = 3; end; t: test(); C = 5 + t");
      }).toThrowError(CompileError);
    });

    it("should error when using imported model variable inside formula", () => {
      expect(() => {
        compileToIr("model test; A = 3; end; t: test(); C = 5 + t.A");
      }).toThrowError(CompileError);
    });
  });

  describe("renaming", () => {
    it("should rename variables", () => {
      expectCompilesTo(
        "A is B",
        model({
          variables: {
            B: parameter(0),
          },
        }),
      );
    });

    it("should rename variables in reactants", () => {
      expectCompilesTo(
        "J: A + A2 -> A3; k1; A is B",
        model({
          variables: {
            B: species(0),
            A2: species(0),
            A3: species(0),
          },
          reactions: {
            J: reaction({ B: 1, A2: 1 }, { A3: 1 }, expr.var("k1")),
          },
        }),
      );
    });

    it("should rename variables in products", () => {
      expectCompilesTo(
        "J: A3 + A2 -> B; k1; A is B",
        model({
          variables: {
            B: species(0),
            A2: species(0),
            A3: species(0),
          },
          reactions: {
            J: reaction({ A3: 1, A2: 1 }, { B: 1 }, expr.var("k1")),
          },
        }),
      );
    });

    it("should rename variables in rate laws", () => {
      expectCompilesTo(
        "J: A + B -> C; k1; k1 is k2",
        model({
          variables: {
            A: species(0),
            B: species(0),
            C: species(0),
            k2: parameter(0),
          },
          reactions: {
            J: reaction({ A: 1, B: 1 }, { C: 1 }, expr.var("k2")),
          },
        }),
      );
    });

    it("should rename variables in event triggers", () => {
      expectCompilesTo(
        "E: at A > 3: C = 3; A is B",
        model({
          variables: {
            B: parameter(0),
            C: parameter(0),
          },
          events: {
            E: event(expr.gt(expr.var("B"), expr.num(3)), { C: expr.num(3) }),
          },
        }),
      );
    });

    it("should rename variables in event assignments", () => {
      expectCompilesTo(
        "E: at time > 3: A = 3; A is B",
        model({
          variables: {
            B: parameter(0),
          },
          events: {
            E: event(expr.gt(expr.var("time"), expr.num(3)), {
              B: expr.num(3),
            }),
          },
        }),
      );
    });

    it("should inherit assignment when renaming to existing variable", () => {
      expectCompilesTo(
        "B = 3; species A = 1; A is B",
        model({
          variables: {
            B: parameter(3),
          },
        }),
      );
    });

    it("should allow re-assigning to old name when it is a variable", () => {
      expectCompilesTo(
        "B = 3; A is B; A = 1",
        model({
          variables: {
            B: parameter(1),
          },
        }),
      );
    });

    it("should allow re-assigning to old name when it is a variable", () => {
      expectCompilesTo(
        "B = 3; A is B; A = 1",
        model({
          variables: {
            B: parameter(1),
          },
        }),
      );
    });

    it("should update rate law of reaction when assigning to new name", () => {
      expectCompilesTo(
        "J: A + B -> C; k1; J is D; D = 10",
        model({
          variables: {
            A: species(0),
            B: species(0),
            C: species(0),
          },
          reactions: {
            D: reaction({ A: 1, B: 1 }, { C: 1 }, expr.num(10)),
          },
        }),
      );
    });

    it("should update trigger of event when assigning to new name", () => {
      expectCompilesTo(
        "E: at time > 3: A = 3; E is D; D = 10",
        model({
          variables: {
            A: parameter(0),
          },
          events: {
            D: event(expr.num(10), { A: expr.num(3) }),
          },
        }),
      );
    });

    it("should allow renaming variable in submodule to one in module", () => {
      expectCompilesTo(
        `module test
            A + B -> C; k1
            k1 = 4
        end
        sub: test()
        A + B -> C; k1
        sub.A is A`,
        model({
          variables: {
            A: species(0),
            B: species(0),
            C: species(0),
            k1: parameter(0),
            sub__B: species(0),
            sub__C: species(0),
            sub__k1: parameter(4),
          },
          reactions: {
            sub___J0: reaction(
              { A: 1, sub__B: 1 },
              { sub__C: 1 },
              expr.var("sub__k1"),
            ),
            _J0: reaction({ A: 1, B: 1 }, { C: 1 }, expr.var("k1")),
          },
        }),
      );
    });
  });
});

describe("wasm", () => {
  it("should compile valid WASM", () => {
    const document = buildAntimonyDocument(defaultModel);
    const ir = compileToIridium(document);
    const { bytecode } = compileIntermediate(ir);

    if (WRITE_BASIC_MODEL) {
      writeFileSync("defaultModel.wasm", bytecode);
    }

    expect(WebAssembly.validate(bytecode)).toBe(true);
  });
});
