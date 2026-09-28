import { describe, expect, it } from "vitest";
import SaxParser from "@nodable/sax";
import { type IridiumExpression } from "../../ir/ast";
import { ContextStateMachine } from "../compile";
import { MathContext } from "../contexts/math";
import { Context, pushContext, type ContextResult } from "../contexts/base";
import { expr } from "../../ir/dsl";
import { SbmlCompileError } from "../errors";
import type { UnknownAttrs } from "../attrs";

const compileMathMl = (mathml: string): IridiumExpression | undefined => {
  let expression: IridiumExpression | undefined;
  class DefaultContext extends Context {
    constructor() {
      super();
    }

    onStartElement(
      name: string,
      _attrs: UnknownAttrs,
    ): ContextResult | undefined {
      if (name === "math") {
        return pushContext(new MathContext());
      }
    }
    onPop(context: Context, result?: unknown): void {
      if (context instanceof MathContext) {
        expression = result as IridiumExpression;
      }
    }
  }
  const stateMachine = new ContextStateMachine(new DefaultContext());
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
      expr.builtinVar("time"),
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
      expr.builtinCall("minus", [expr.num(5)]),
    );
  });

  it("should work on apply with multiple arguments", () => {
    expectExpression(
      "<apply><times /> <cn> 5 </cn> <cn> 10 </cn> <cn> 30 </cn></apply>",
      expr.builtinCall("times", [expr.num(5), expr.num(10), expr.num(30)]),
    );
  });
});

describe("piecewise", () => {
  it("should parse piecewise", () => {
    expectExpression(
      `<piecewise>
        <piece>
         <cn> 0 </cn>
         <apply><lt/><ci> x </ci> <cn> 0 </cn></apply>
        </piece>
        <otherwise>
         <ci> x </ci>
        </otherwise>
       </piecewise>`,
      expr.builtinCall("piecewise", [
        expr.num(0),
        expr.builtinCall("lt", [expr.var("x"), expr.num(0)]),
        expr.var("x"),
      ]),
    );

    expectExpression(
      `<piecewise>
        <piece>
            <apply><minus/><ci> x </ci></apply>
            <apply><lt/><ci> x </ci> <cn> 0 </cn></apply>
        </piece>
        <piece>
            <cn> 0 </cn>
            <apply><eq/><ci> x </ci> <cn> 0 </cn></apply>
        </piece>
        <piece>
            <ci> x </ci>
            <apply><gt/><ci> x </ci> <cn> 0 </cn></apply>
        </piece>
      </piecewise>`,
      expr.builtinCall("piecewise", [
        expr.builtinCall("minus", [expr.var("x")]),
        expr.builtinCall("lt", [expr.var("x"), expr.num(0)]),
        expr.num(0),
        expr.builtinCall("eq", [expr.var("x"), expr.num(0)]),
        expr.var("x"),
        expr.builtinCall("gt", [expr.var("x"), expr.num(0)]),
      ]),
    );
  });

  it("should parse nested piecewise", () => {
    expectExpression(
      `<piecewise>
        <piece>
          <apply><minus/><ci>x</ci></apply>
          <apply><lt/><ci>x</ci><cn>0</cn></apply>
        </piece>
        <otherwise>
          <piecewise>
            <piece>
              <cn>0</cn>
              <apply><eq/><ci>x</ci><cn>0</cn></apply>
            </piece>
            <piece>
              <ci>x</ci>
              <apply><gt/><ci>x</ci><cn>0</cn></apply>
            </piece>
          </piecewise>
        </otherwise>
      </piecewise>`,
      expr.builtinCall("piecewise", [
        expr.builtinCall("minus", [expr.var("x")]),
        expr.builtinCall("lt", [expr.var("x"), expr.num(0)]),

        expr.builtinCall("piecewise", [
          expr.num(0),
          expr.builtinCall("eq", [expr.var("x"), expr.num(0)]),

          expr.var("x"),
          expr.builtinCall("gt", [expr.var("x"), expr.num(0)]),
        ]),
      ]),
    );
  });
});

describe("log", () => {
  it("should error with bad logbase", () => {
    expect(() => {
      compileMathMl("<logbase> <cn> 5 </cn> </logbase>");
    }).toThrowError(SbmlCompileError);

    expect(() => {
      compileMathMl("<log/> <logbase> <cn> 5 </cn> </logbase>");
    }).toThrowError(SbmlCompileError);
  });

  it("should compile log", () => {
    expectExpression(
      "<apply><log/><logbase><cn>5</cn></logbase><cn>10</cn></apply>",
      expr.builtinCall("log", [expr.num(5), expr.num(10)]),
    );
  });
});

describe("root", () => {
  it("should error with bad degree", () => {
    expect(() => {
      compileMathMl("<degree><cn>2</cn></degree>");
    }).toThrowError(SbmlCompileError);

    expect(() => {
      compileMathMl("<root/><degree><cn>2</cn></degree>");
    }).toThrowError(SbmlCompileError);
  });

  it("should compile root with degree", () => {
    expectExpression(
      "<apply><root/><degree><cn>3</cn></degree><cn>8</cn></apply>",
      expr.builtinCall("root", [expr.num(3), expr.num(8)]),
    );
  });
});

describe("semantics", () => {
  it("should error when there is no child", () => {
    expect(() => {
      compileMathMl("<semantics></semantics>");
    }).toThrowError(SbmlCompileError);
  });

  it("should error when the first child is not a math one", () => {
    expect(() => {
      compileMathMl("<semantics><annotation>hey</annotation></semantics>");
    }).toThrowError(SbmlCompileError);
  });

  it("should error with unknown element", () => {
    expect(() => {
      compileMathMl(
        "<semantics><cn> 5 </cn><unknown>hey</unknown></semantics>",
      );
    }).toThrowError(SbmlCompileError);
  });

  it("should have the value of its first child", () => {
    expectExpression(
      "<semantics><cn>3</cn><annotation>idk</annotation></semantics>",
      expr.num(3),
    );
  });

  it("should support nested annotation-xml", () => {
    expectExpression(
      `
<semantics>
  <cn> 3 </cn>
  <annotation-xml>
    <semantics>
      <cn> 3 </cn>
      <annotation-xml>
        <semantics>
          <cn> 3 </cn>
          <annotation-xml>
            <semantics>
              <cn> 3 </cn>
              <annotation-xml>idk</annotation-xml>
            </semantics>
          </annotation-xml>
        </semantics>
      </annotation-xml>
    </semantics>
  </annotation-xml>
</semantics>`,
      expr.num(3),
    );
  });
});

it("should error on unexpected element", () => {
  expect(() => {
    compileMathMl("<unknown />");
  }).toThrowError(SbmlCompileError);
});
