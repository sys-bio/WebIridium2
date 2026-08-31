import { describe, it, expect } from "vitest";
import {
  type ANTLRErrorListener,
  CharStreams,
  CommonTokenStream,
} from "antlr4ts";
import { AntimonyLexer } from "../generated/AntimonyLexer.ts";
import { AntimonyParser, RootContext } from "../generated/AntimonyParser";

const parse = (code: string): RootContext => {
  const inputStream = CharStreams.fromString(code);
  const lexer = new AntimonyLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new AntimonyParser(tokenStream);

  lexer.removeErrorListeners();
  parser.removeErrorListeners();

  const errorListener: ANTLRErrorListener<unknown> = {
    syntaxError: (
      _recognizer,
      offendingSymbol,
      line,
      charPositionInLine,
      msg,
      _,
    ) => {
      throw new Error(
        // eslint-disable-next-line
        `${offendingSymbol} line ${line} pos ${charPositionInLine}: ${msg}`,
      );
    },
  };

  lexer.addErrorListener(errorListener);
  parser.addErrorListener(errorListener);

  return parser.root();
};

const itShouldSucceedForAll = (models: Record<string, string>): void => {
  for (const [name, code] of Object.entries(models)) {
    it(`${name} should not error`, () => {
      expect(() => {
        parse(code);
      }).not.toThrow();
    });
  }
};

const itShouldErrorForAll = (models: Record<string, string>): void => {
  for (const [name, code] of Object.entries(models)) {
    it(`${name} should error`, () => {
      expect(() => {
        console.log(parse(code).toStringTree(AntimonyParser.ruleNames));
      }).toThrow();
    });
  }
};

describe("good models", () => {
  const goodModels: Record<string, string> = import.meta.glob(
    "./good-parse/*.ant",
    {
      eager: true,
      query: "?raw",
      import: "default",
    },
  );

  itShouldSucceedForAll(goodModels);
});

describe("examples", () => {
  const exampleModels: Record<string, string> = import.meta.glob(
    // feels wrong to grab files from a different package, but whatever
    "@/assets/examples/*.ant",
    {
      eager: true,
      query: "?raw",
      import: "default",
    },
  );

  for (const [name, code] of Object.entries(exampleModels)) {
    it(`${name} should not error`, () => {
      expect(() => {
        parse(code);
      }).not.toThrow();
    });

    it(`${name} should error when prefixed with "model"`, () => {
      expect(() => {
        parse("model\n" + code);
      }).toThrow();
    });
  }
});

describe("bad models", () => {
  const badModels: Record<string, string> = import.meta.glob(
    "./bad-parse/*.ant",
    {
      eager: true,
      query: "?raw",
      import: "default",
    },
  );

  itShouldErrorForAll(badModels);
});

describe("model", () => {
  itShouldErrorForAll({
    nesting: "model A; model B; end; end",
  });
});

describe("assignment", () => {
  itShouldErrorForAll({
    space: "A B = 5",
    missingCompartment: "A in = 5",
  });

  itShouldSucceedForAll({
    basic: "A = 5",
    rule: "A := 5",
    ruleSpace: "A: =5",
    rate: "A' = 5",
    rate2: "A '= 5",
    compartmentInitial: "A in B = 5",
    compartmentRule: "A in B := 5",
    compartmentRate: "A in B '= 5",
    empty: "A=",
    empty2: "A:=",
    empty3: "A'=",
    empty4: "A'=;A=",
  });
});

describe("reaction", () => {
  itShouldErrorForAll({
    // libantimony doesn't accept this as input, but it does as output
    // missingBothSides: "->;k1",
  });

  itShouldSucceedForAll({
    named: "_J1: A -> B; k1",
    namedCompartment: "_J1 in comp1: A -> B; k1",
    namedCompartment2: "_J1: A -> B; k1 in comp1",
  });
});

describe("event", () => {
  itShouldErrorForAll({
    extraComma: "at time > 5: A = 3,",
    // libantimony doesn't accept this as input, but it does as output
    // noAssignment: "at time > 5:",
    missingColon: "at time > 5 A = 3",
    missingEnd: "at time > 5",
    rateRule: "at time > 5: A' = 5",
    incorrectFormula: "at time +: A = 3",
    incorrectFormula2: "at time +-: A = 3",
    incorrectFormula3: "at (time > 30: A = 3",
    assignmentRule: "at time > 5: A := 5",
    missingDelay: "at 5 after: A = 5",
    // libantimony doesn't accept this as input, but it does as output
    // delayNoAssignment: "at 5 after 3:",
    delayNoAssignment2: "at 5 after:",
    optionExtraComma: "at dog > 5,: dog = 6",
    optionNoEquals: "at dog > 5, cat: dog = 6",
    optionNoFormula: "at dog > 5, cat =: dog = 6",
    optionExtraComment2: "at dog > 5, cat = 3, : dog = 6",
    optionExtraEqual: "at dog > 5, cat = 3, = : dog = 6",
  });

  itShouldSucceedForAll({
    simple: "at time > 5: A = 3",
    simpleMultiple: "at time > 5: A = 3, B = 3, C = 5",
    simpleParentheses: "at (time > 5): A = 3",
    complexFormula: "at time > (A + B^2) / (k1 * k2):A = 3",
    multiline: "at time > 5:\nA = 3",
    multilines: "at time > 5:\n   \n  \t \nA = 3",
    multilinesComma: "at time > 5:\n   \n  \t \nA = 3,\n\tB = 3",
    noSpaces: "at time>5:A=3",
    delay: "at 5 after time > 3: A = 4\nA=3",
    delayFormula: "at B * C after 5 > 3: A = 3",
    option: "at dog > 5, priority = 5: dog = 6",
    option2: "at dog > 5, t0=true, p3=2: dog = 6",
    delayWithOption: "at 5 after dog > 5, t0=true, p3=2: dog = 6",
    delayWithOption2: "at 5 after dog > 5, t0=false: dog = 6",
  });
});

describe("declaration", () => {
  itShouldErrorForAll({
    plainName: "a",
    extraComma: "var a,",
    extraComma2: "var a,b,",
    extraComma3: "var ,",
    varConst: "var const a",
    varConst2: "var const species a",
    compartmentMissing: "species a in",
    invertedSubstanceOnly: "species substanceOnly A",
  });

  itShouldSucceedForAll({
    species: "species a",
    formula: "formula a",
    compartment: "compartment a",
    gene: "gene a",
    dna: "dna a",
    operator: "operator a",
    const: "const species a",
    var: "var species a",
    assign: "var species a = 5",
    assign2: "species a = 5",
    rateAssign: "species a' = 5",
    ruleAssign: "species a := 5",
    multipleAssign: "species a := 5, b = 5, c = 10.3e+3",
    multipleAssignAndDeclare: "species a = 5, b, c, d = 10",
    inCompartment: "compartment C in D",
    inCompartmentMultiple: "compartment C in D, A in B = 5, A, B, D in A.B = 5",
    substanceOnly: "substanceOnly species A",
    singleSubstanceOnly: "substanceOnly A",
  });
});

describe("annotations", () => {
  itShouldErrorForAll({
    extraComma: `A is "test",`,
    unterminatedString: `A is "hey;`,
    unterminatedString2: "A is ```hey",
    backtickEmpty: "A is ``````",
    backtickDouble: "A is ````",
    backtickDouble2: "A is ``hey``",
    backtickSingle: "A is `hey`",
    missingItem: `A "test"`,
    missingString: `A is `,
    extraDot: `A. is "test"`,
    extraDot2: `A is. "test"`,
    hasNothing: "A has",
    hasOperator: "A has +",
    escapeBacktick: "A is ```\\````",
  });

  itShouldSucceedForAll({
    single: `A is "test"`,
    single2: `A hasPart "test"`,
    invalidItem: `A invalidItem "test"`,
    single4: `A is "test"`,
    multiple: `A is "test", "test2"`,
    multiple3: `A is "test", "test2", "test3"`,
    multipleMultiline: `A is "test",\n    "test2"`,
    backtick: "A is ```test```",
    backtick2: "A is ```test\n\ttest```",
    backtickInsideBacktick: "A is ````` ```",
    backtickMultiple: "A is ```test\n```,```test\n```,```test\n```",
    backtickEmpty2: "A is ``",
    subItem: `A creator.name "test"`,
    subItemMultiple: `A creator.name "test", "test"`,
    has: "A has test",
    has2: "A has 1 meter / second^2",
    has3: "A has ```unit```",
    has4: `A has "unit"`,
    escape: `A is "me\\""`,
  });
});

describe("in statement", () => {
  itShouldErrorForAll({
    missingCompartment: "in B",
    missingVariable: "A in",
  });

  itShouldSucceedForAll({
    simple: "A in B",
    nested: "A.V in B.C",
  });
});

describe("function definition", () => {
  itShouldSucceedForAll({
    oneParam: "function a(b)b end",
    whitespace: "function a(b)\n\n\n\t\t   b\t\t\n\n end",
    noParam: "function a() 5 end",
    semicolons: "function a(b);b;end",
    threeParam: "function a(b,d,e) b+d+e end",
  });

  itShouldErrorForAll({
    noBody: "function a(b)end",
    extraComma: "function a(b,)end",
    extraComma2: "function a(b,c,)end",
    noEnd: "function a(b)b",
    noParameters: "function a a end",
    noName: "function(a) a end",
    functionInsideModel: "model A\nfunction a() 5 end\nend",
  });
});

describe("model import", () => {
  itShouldSucceedForAll({
    simple: "A()",
    simpleWithList: "A(C,D)",
    simpleWithSingularList: "A(C)",
    dot: "A(B.D)",
    dotAndNoDot: "A(B.D, E, F, G.H.I)",
    named: "M: A()",
    namedDot: "M: A(B.D)",
    compartment: "M in C: A()",

    option: "M(), extentconv = 5",
    options: "M(), extentconv = 5, timeconv = 10",
    optionWithNameLabel: "A: M(), extentconv = 10",
    optionsWithNameLabel: "A: M(), extentconv = 10, timeconv = 100",
    optionVariable: "M(), extentconv = var1",
    optionsMixed: "M(), extentconv = var1, timeconv = 10",
    optionsMixedWithNameLabel: "A: M(), extentconv = var1, timeconv = 10",
    optionSubvariable: "M(), extentconv = A.M",
    optionConstantVariable: "M(), extentconv = $M",
    optionUnknown: "M(), unknown = 4.5",
    optionConstant: "M(), extentconv = $A",
    optionConstantSubvariable: "M(), extentconv = $A.Test",
  });

  itShouldErrorForAll({
    missingParenthesis: "A(",
    extraComma: "A(B,)",
    extraComma2: "A(B.C,)",
    dotMissing: "A(B.)",
    optionExtraComma: "A(), extentconv = 5,",
    optionSubvariable: "A(), extentconv.test = 5,",
  });
});

describe("rename", () => {
  itShouldSucceedForAll({
    simple: "A is B",
    dot: "A.B is B.C",
    conversionFactorLeft: "A * c is B",
    conversionFactorLeft2: "A.B * c is B.B",
    conversionFactorRight: "A is B / c",
    conversionFactorRight2: "A.B is B.B / c",
  });

  itShouldErrorForAll({
    multiple: "A is B, C",
    conversionFactorNumberLeft: "A * 5 is B",
    conversionFactorNumberRight: "A is B / 5",
    conversionFactorBoth: "A * 5 is B / 5",
  });
});

describe("delete", () => {
  itShouldSucceedForAll({
    simple: "delete A",
    simple2: "delete A.B",
    simple3: "delete A.B;",
    insideModel: "delete sub1.E0;",
  });

  itShouldErrorForAll({
    string: 'delete "hey"',
    number: "delete 5",
    call: "delete test()",
    labeled: "J: delete test",
  });
});
