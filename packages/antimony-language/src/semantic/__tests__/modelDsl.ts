/**
 * Simple DSL for expressing partial models as represented in semantic/document.ts.
 * Meant to be used for testing with expect().toMatchObject.
 */

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-empty-object-type */

import type { AntimonyReference } from "../document";

export type TestModel = {
  kind: "model";
  objects: Record<string, any>;
  unnamedImports?: any[];
  exports?: (string | number)[][];
  timeConversionFactor?: number | AntimonyReference;
  extentConversionFactor?: number | AntimonyReference;
};

export const model = (
  objects: Record<string, any>,
  unnamedImports?: any[],
  exports?: string[],
  extra?: { timeconv?: number | string; extentconv?: number | string },
): TestModel => {
  for (const [name, object] of Object.entries(objects)) {
    // eslint-disable-next-line
    object.name = name;
  }

  const model: TestModel = {
    kind: "model",
    objects,
  };

  if (unnamedImports) {
    model.unnamedImports = unnamedImports;
  }

  if (exports) {
    model.exports = exports.map((v) => stringToReference(v));
  }

  if (extra) {
    if (typeof extra.timeconv === "number") {
      model.timeConversionFactor = extra.timeconv;
    } else if (typeof extra.timeconv === "string") {
      model.timeConversionFactor = stringToReference(extra.timeconv);
    }

    if (typeof extra.extentconv === "number") {
      model.extentConversionFactor = extra.extentconv;
    } else if (typeof extra.extentconv === "string") {
      model.extentConversionFactor = stringToReference(extra.extentconv);
    }
  }

  return model;
};

type FuncWithModifiers<
  Func extends (this: {}, ...args: any[]) => any,
  Modifiers extends Record<
    string,
    (state: ThisParameterType<Func>) => ThisParameterType<Func>
  >,
> = OmitThisParameter<Func> & {
  [key in keyof Modifiers]: FuncWithModifiers<Func, Modifiers>;
};

const funcWithModifiers = <
  Func extends (this: {}, ...args: any) => any,
  Modifiers extends Record<
    string,
    (state: ThisParameterType<Func>) => ThisParameterType<Func>
  >,
>(
  modifiers: Modifiers,
  func: Func,
): FuncWithModifiers<Func, Modifiers> => {
  const proxy: ProxyHandler<any> = {
    apply(target, _thisArg, argArray) {
      return func.apply(target, argArray);
    },
    get(target, property, _receiver) {
      if (typeof property === "string" && Object.hasOwn(modifiers, property)) {
        return new Proxy(
          Object.assign(function () {}, modifiers[property](target)),
          proxy,
        );
      } else {
        throw new Error(`Invalid modifier: ${String(property)}.`);
      }
    },
  };
  return new Proxy(function () {}, proxy);
};

type VariableState = {
  const?: boolean;
  assignmentType?: "initial" | "rate" | "rule";
  substanceOnly?: boolean;
};

const variableModifiers = {
  const: (state: VariableState): VariableState => ({ ...state, const: true }),
  var: (state: VariableState): VariableState => ({ ...state, const: false }),
  substanceOnly: (state: VariableState): VariableState => ({
    ...state,
    substanceOnly: true,
  }),
  rate: (state: VariableState): VariableState => ({
    ...state,
    assignmentType: "rate",
  }),
  rule: (state: VariableState): VariableState => ({
    ...state,
    assignmentType: "rule",
  }),
};

const antimonyObjectProto = {
  in(this: Record<string, unknown>, compartment: string) {
    this.compartment = stringToReference(compartment);
    return this;
  },
  display(this: Record<string, unknown>, displayName: string) {
    this.displayName = displayName;
    return this;
  },
  deleted(this: Record<string, unknown>) {
    this.isDeleted = true;
    return this;
  },
};

const createVariableFunc = (kind: string) => {
  return funcWithModifiers(
    variableModifiers,
    // not the correct return type but whatever
    function (
      this: VariableState,
      formulaOrRule?: string,
      rate?: string,
    ): typeof antimonyObjectProto {
      if (formulaOrRule) {
        return Object.assign(Object.create(antimonyObjectProto), {
          kind: "variable",
          variableKind: kind,
          isConst: this.const ?? false,
          hasSubstanceOnly: this.substanceOnly ?? false,
          assignment:
            this.assignmentType === "rule"
              ? {
                  kind: "rule",
                  rule: { ctx: { text: formulaOrRule } },
                }
              : this.assignmentType === "rate"
                ? {
                    kind: "rate",
                    initial: { ctx: { text: formulaOrRule } },
                    rate: { ctx: { text: rate } },
                  }
                : {
                    kind: "initial",
                    initial: { ctx: { text: formulaOrRule } },
                  },
        });
      }

      return Object.assign(Object.create(antimonyObjectProto), {
        kind: "variable",
        variableKind: kind,
        isConst: this.const ?? false,
        hasSubstanceOnly: this.substanceOnly ?? false,
      });
    },
  );
};

export const species = createVariableFunc("species");

export const parameter = createVariableFunc("parameter");

export const compartment = createVariableFunc("compartment");

const stringToReference = (s: string) => {
  return s.split(".").map((v) => {
    const n = Number(v);
    if (Number.isNaN(n)) {
      return v;
    } else {
      return n;
    }
  });
};

export const reaction = (
  reactants: Record<string, string | number | null>,
  products: Record<string, string | number | null>,
  rate?: string,
): typeof antimonyObjectProto => {
  return Object.assign(Object.create(antimonyObjectProto), {
    kind: "reaction",
    reactants: Object.entries(reactants).map(([name, stoichiometry]) => ({
      reference: stringToReference(name),
      stoichiometry:
        stoichiometry === null
          ? undefined
          : { ctx: { text: stoichiometry.toString() } },
    })),
    products: Object.entries(products).map(([name, stoichiometry]) => ({
      reference: stringToReference(name),
      stoichiometry:
        stoichiometry === null
          ? undefined
          : { ctx: { text: stoichiometry.toString() } },
    })),
    rate:
      rate !== undefined
        ? {
            ctx: { text: rate },
          }
        : undefined,
  });
};

export const event = (
  trigger: string,
  assignmentsOrOptions: Record<string, string>,
  assignments?: Record<string, string>,
): typeof antimonyObjectProto => {
  const newAssignments: Record<string, { ctx: { text: string } }> = {};
  if (assignments) {
    const delay = assignmentsOrOptions.delay;

    if ("delay" in assignmentsOrOptions) {
      delete assignmentsOrOptions.delay;
    }

    for (const [name, value] of Object.entries(assignments)) {
      newAssignments[name] = { ctx: { text: value } };
    }

    const newOptions: Record<string, { ctx: { text: string } }> = {};
    for (const [name, value] of Object.entries(assignmentsOrOptions)) {
      newOptions[name] = { ctx: { text: value } };
    }

    return Object.assign(Object.create(antimonyObjectProto), {
      kind: "event",
      trigger: { ctx: { text: trigger } },
      delay: delay && { ctx: { text: delay } },
      assignments: newAssignments,
      options: newOptions,
    });
  } else {
    for (const [name, value] of Object.entries(assignmentsOrOptions)) {
      newAssignments[name] = { ctx: { text: value } };
    }

    return Object.assign(Object.create(antimonyObjectProto), {
      kind: "event",
      trigger: { ctx: { text: trigger } },
      assignments: newAssignments,
      options: {},
    });
  }
};

export const renameLink = (
  to: string | AntimonyReference,
  conversionFactor?: string | AntimonyReference,
) => ({
  kind: "renameLink",
  to: typeof to === "string" ? stringToReference(to) : to,
  conversionFactor:
    typeof conversionFactor === "string"
      ? stringToReference(conversionFactor)
      : conversionFactor,
});
