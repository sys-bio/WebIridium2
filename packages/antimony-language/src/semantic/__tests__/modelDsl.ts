/**
 * Simple DSL for expressing partial models as represented in semantic/model.ts.
 * Meant to be used for testing with expect().toMatchObject.
 */

export type TestModel = {
  objects: Record<string, any>;
  unnamedImports: any[];
};

export const model = (
  objects: Record<string, any>,
  unnamedImports?: any[],
): TestModel => {
  for (const [name, object] of Object.entries(objects)) {
    // eslint-disable-next-line
    object.name = name;
  }

  return { objects, unnamedImports: unnamedImports ?? [] };
};

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-empty-object-type */

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

/* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-empty-object-type */

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

const variableProto = {
  in(this: Record<string, unknown>, compartment: string) {
    this.compartment = compartment.split(".");
    return this;
  },
  display(this: Record<string, unknown>, displayName: string) {
    this.displayName = displayName;
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
    ): typeof variableProto {
      if (formulaOrRule) {
        // eslint-disable-next-line
        return Object.assign(Object.create(variableProto), {
          kind: "variable",
          variableKind: kind,
          isConst: this.const ?? false,
          hasSubstanceOnly: this.substanceOnly ?? false,
          assignment:
            this.assignmentType === "rule"
              ? {
                  kind: "rule",
                  rule: { text: formulaOrRule },
                }
              : this.assignmentType === "rate"
                ? {
                    kind: "rate",
                    initial: { text: formulaOrRule },
                    rate: { text: rate },
                  }
                : {
                    kind: "initial",
                    initial: { text: formulaOrRule },
                  },
        });
      }

      // eslint-disable-next-line
      return Object.assign(Object.create(variableProto), {
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

export const reaction = (
  reactants: Record<string, number | null>,
  products: Record<string, number | null>,
  rate?: string,
  extra?: { in?: string },
) => {
  let compartment = null;
  if (extra && extra.in) {
    compartment = extra.in.split(".");
  }

  return {
    kind: "reaction",
    reactants: Object.entries(reactants).map(([name, stoichiometry]) => ({
      reference: name.split("."),
      stoichiometry: stoichiometry === null ? undefined : stoichiometry,
    })),
    products: Object.entries(products).map(([name, stoichiometry]) => ({
      reference: name.split("."),
      stoichiometry: stoichiometry === null ? undefined : stoichiometry,
    })),
    rate:
      rate !== undefined
        ? {
            text: rate,
          }
        : undefined,
    compartment,
  };
};

export const event = (
  trigger: string,
  assignmentsOrOptions: Record<string, string>,
  assignments?: Record<string, string>,
) => {
  const newAssignments: Record<string, { text: string }> = {};
  if (assignments) {
    const delay = assignmentsOrOptions.delay;

    if ("delay" in assignmentsOrOptions) {
      delete assignmentsOrOptions.delay;
    }

    for (const [name, value] of Object.entries(assignments)) {
      newAssignments[name] = { text: value };
    }

    const newOptions: Record<string, { text: string }> = {};
    for (const [name, value] of Object.entries(assignmentsOrOptions)) {
      newOptions[name] = { text: value };
    }

    return {
      kind: "event",
      trigger: { text: trigger },
      delay: delay && { text: delay },
      assignments: newAssignments,
      options: newOptions,
    };
  } else {
    for (const [name, value] of Object.entries(assignmentsOrOptions)) {
      newAssignments[name] = { text: value };
    }

    return {
      kind: "event",
      trigger: { text: trigger },
      assignments: newAssignments,
      options: {},
    };
  }
};
