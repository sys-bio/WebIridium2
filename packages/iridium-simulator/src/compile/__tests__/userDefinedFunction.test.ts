import { CompileInvariantError } from "../errors";
import { describe, it, expect } from "vitest";
import { checkNoRecursiveCalls } from "../userDefinedFunction";
import { expr, func } from "../../ir/dsl";

describe("checkNoRecursiveCalls", () => {
  it("should error on simple recursive calls", () => {
    expect(() => {
      checkNoRecursiveCalls([
        {
          name: "test",
          ...func([], expr.add(expr.call("test2", []), expr.num(5))),
        },
        {
          name: "test2",
          ...func([], expr.add(expr.call("test", []), expr.num(5))),
        },
      ]);
    }).toThrowError(CompileInvariantError);
  });

  it("should error on simple recursive calls 2", () => {
    expect(() => {
      checkNoRecursiveCalls([
        {
          name: "no",
          ...func([], expr.add(expr.call("no2", []), expr.num(5))),
        },
        {
          name: "no2",
          ...func([], expr.add(expr.call("no3", []), expr.num(5))),
        },
        {
          name: "no3",
          ...func([], expr.add(expr.call("sqrt", []), expr.num(5))),
        },
        {
          name: "test",
          ...func([], expr.add(expr.call("test2", []), expr.num(5))),
        },
        {
          name: "test2",
          ...func([], expr.add(expr.call("test", []), expr.num(5))),
        },
      ]);
    }).toThrowError(CompileInvariantError);
  });

  it("should error on multi-step recursive calls", () => {
    expect(() => {
      checkNoRecursiveCalls([
        {
          name: "test",
          ...func([], expr.add(expr.call("test2", []), expr.num(5))),
        },
        {
          name: "test2",
          ...func([], expr.add(expr.call("test3", []), expr.call("test4", []))),
        },
        {
          name: "test3",
          ...func([], expr.add(expr.call("test4", []), expr.call("test5", []))),
        },
        {
          name: "test4",
          ...func([], expr.add(expr.call("test5", []), expr.call("test6", []))),
        },
        {
          name: "test5",
          ...func([], expr.add(expr.call("test6", []), expr.call("test7", []))),
        },
        {
          name: "test6",
          ...func([], expr.add(expr.call("test7", []), expr.call("test8", []))),
        },
        {
          name: "test7",
          ...func([], expr.add(expr.call("floor", []), expr.call("ceil", []))),
        },
        {
          name: "test8",
          ...func([], expr.add(expr.call("test", []), expr.call("ceil", []))),
        },
      ]);
    }).toThrowError(CompileInvariantError);
  });

  it("should not error with no recursive calls", () => {
    expect(() => {
      checkNoRecursiveCalls([
        {
          name: "test",
          ...func([], expr.add(expr.call("test3", []), expr.num(5))),
        },
        {
          name: "test2",
          ...func([], expr.add(expr.call("test3", []), expr.num(5))),
        },
        {
          name: "test3",
          ...func([], expr.add(expr.call("ceil", []), expr.num(5))),
        },
      ]);
    }).not.toThrow();
  });
});
