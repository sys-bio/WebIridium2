import { describe, it, expect } from "vitest";
import type { IridiumExpression } from "../../ir/ast";
import Emitter from "../Emitter";
import { Compilation } from "../Compilation";
import { GlobalScope } from "../scope";
import { FunctionTable, LocalsSymbolTable } from "../symbolTables";
import { emitExpression } from "../expression";
import { OpCode, ValType } from "../codes";
import { expr } from "../../ir/dsl";
import { EVENTS_PARAM, P_PARAM, T_PARAM, Y_PARAM } from "../../names";

const expectCompile = (
  expression: IridiumExpression,
  builder: (emitter: Emitter) => void,
) => {
  const compilation = new Compilation({
    events: [],
    variables: [
      {
        name: "test",
        value: { kind: "initial", initial: expression },
        hasSubstanceOnly: false,
      },
    ],
    reactions: [],
    compartments: [],
    functions: [],
  });

  const expected = new Emitter();
  builder(expected);

  const got = new Emitter();
  emitExpression(
    expression,
    got,
    new GlobalScope(
      compilation,
      new LocalsSymbolTable([T_PARAM, Y_PARAM, P_PARAM, EVENTS_PARAM]),
      new FunctionTable(),
    ),
  );

  expect(Array.from(got.getOutput())).toEqual(Array.from(expected.getOutput()));
};

describe("binary", () => {
  it("should compile addition", () => {
    expectCompile(expr.add(expr.num(1), expr.num(2)), (emitter) => {
      emitter.emitF64ConstOp(1);
      emitter.emitF64ConstOp(2);
      emitter.emitByte(OpCode.f64add);
    });
  });

  it("should compile comparison", () => {
    expectCompile(expr.eq(expr.num(1), expr.num(2)), (emitter) => {
      emitter.emitF64ConstOp(1);
      emitter.emitF64ConstOp(2);
      emitter.emitByte(OpCode.f64eq);
      emitter.emitByte(OpCode.f64convert_u_i32);
    });
  });

  it("should compile and function", () => {
    expectCompile(expr.call("and", [expr.num(1), expr.num(2)]), (emitter) => {
      emitter.emitF64ConstOp(1);
      emitter.emitF64ConstOp(0);
      emitter.emitByte(OpCode.f64ne);
      emitter.emitByte(OpCode.if);
      emitter.emitByte(ValType.i32);
      emitter.emitF64ConstOp(2);
      emitter.emitF64ConstOp(0);
      emitter.emitByte(OpCode.f64ne);
      emitter.emitByte(OpCode.else);
      emitter.emitI32ConstOp(0);
      emitter.emitByte(OpCode.end);
      emitter.emitByte(OpCode.f64convert_u_i32);
    });
  });
});
