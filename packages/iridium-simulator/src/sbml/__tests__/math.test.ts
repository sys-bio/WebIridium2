import { describe, expect, it } from "vitest";
import type { IridiumExpression } from "../../ir/ast";
import { Builder, type UnknownAttrs } from "../builder";
import SaxParser from "@nodable/sax";
import { ContextStateMachine } from "../compile";
import { MathContext } from "../contexts/math";
import { Context, pushContext, type ContextResult } from "../contexts/base";
import { expr } from "../../ir/dsl";
import { SbmlCompileError } from "../errors";

const compileMathMl = (mathml: string): IridiumExpression | undefined => {
  const builder = new Builder();
  let expression: IridiumExpression | undefined;
  class DefaultContext extends Context {
    constructor() {
      super(builder);
    }

    onStartElement(
      name: string,
      _attrs: UnknownAttrs,
    ): ContextResult | undefined {
      if (name === "math") {
        return pushContext(new MathContext(builder));
      }
    }
    onPop(context: Context, result?: unknown): void {
      if (context instanceof MathContext) {
        expression = result as IridiumExpression;
      }
    }
  }
  const stateMachine = new ContextStateMachine(builder, new DefaultContext());
  const parser = new SaxParser(stateMachine.getParserOptions());

  parser.parse("<math>" + mathml + "</math>");

  return expression;
};

export const expectExpression = (
  mathml: string,
  expr: IridiumExpression,
): void => {
  const got = compileMathMl(mathml);
  expect(got).toEqual(expr);
};

describe("cn", () => {
  it("should compile reals", () => {
    expectExpression(`<cn type="real"> 123.45 </cn>`, expr.num(123.45));

    expectExpression(`<cn type="real"> -123.45 </cn>`, expr.num(-123.45));

    expectExpression(`<cn type="real"> +123.45 </cn>`, expr.num(123.45));
  });

  it("should compile e-notations", () => {
    expectExpression(
      `<cn type="e-notation"> 12.5 <sep/> 5 </cn>`,
      expr.num(12.5e5),
    );

    expectExpression(
      `<cn type="e-notation" base="16"> 12.5 <sep/> 5 </cn>`,
      expr.num(12.5 * 16 ** 5),
    );
  });

  it("should compile integers", () => {
    expectExpression(`<cn type="integer"> 5 </cn>`, expr.num(5));

    expectExpression(`<cn type="integer" base="16"> AF </cn>`, expr.num(0xaf));
  });

  it("should compile rationals", () => {
    expectExpression(
      `<cn type="rational"> 32 <sep/> 64 </cn>`,
      expr.num(32 / 64),
    );

    expectExpression(
      `<cn type="rational" base="16"> 1A <sep/> 0x68 </cn>`,
      expr.num(0x1a / 0x68),
    );
  });
});

describe("csymbol", () => {
  it("should compile time", () => {
    expectExpression(
      `<csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> t </csymbol>`,
      expr.var("time"),
    );
  });

  it("should compile rateOf", () => {
    expectExpression(
      `<apply>
        <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/rateOf"/>
        <ci> S1 </ci>
       </apply>`,
      expr.rateOf("S1"),
    );
  });
});

describe("apply", () => {
  it("should error on empty apply", () => {
    expect(() => {
      compileMathMl("<apply></apply>");
    }).toThrowError(SbmlCompileError);
  });

  it("should work on apply with one argument", () => {
    expectExpression(
      "<apply><minus /> <cn> 5 </cn></apply>",
      expr.call("minus", [expr.num(5)]),
    );
  });

  it("should work on apply with multiple arguments", () => {
    expectExpression(
      "<apply><times /> <cn> 5 </cn> <cn> 10 </cn> <cn> 30 </cn></apply>",
      expr.call("times", [expr.num(5), expr.num(10), expr.num(30)]),
    );
  });
});

it("should error on unexpected element", () => {
  expect(() => {
    compileMathMl("<unknown />");
  }).toThrowError(SbmlCompileError);
});
