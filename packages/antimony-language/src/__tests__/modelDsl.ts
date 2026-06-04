/**
 * Simple DSL for expressing partial models as represented in semantic/model.ts.
 * Meant to be used for testing with expect().toMatchObject.
 */

export type TestModel = {
  variables?: Record<string, any>;
  reactions?: Record<string, any>;
  events?: Record<string, any>;
};

export const model = ({
  variables,
  reactions,
  events,
}: TestModel): TestModel => {
  if (variables) {
    for (const [name, variable] of Object.entries(variables)) {
      // eslint-disable-next-line
      variable.name = name;
    }
  }

  if (reactions) {
    for (const [name, reaction] of Object.entries(reactions)) {
      // eslint-disable-next-line
      reaction.name = name;
    }
  }

  if (events) {
    for (const [name, event] of Object.entries(events)) {
      // eslint-disable-next-line
      event.name = name;
    }
  }

  return { variables, reactions, events };
};

/** Convenience function for making test model that only consists of variables. */
export const variables = (
  variables: Exclude<TestModel["variables"], undefined>,
): TestModel => {
  for (const [name, variable] of Object.entries(variables)) {
    // eslint-disable-next-line
    variable.name = name;
  }
  return { variables };
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
  assignmentType?: "set" | "rate" | "rule";
};

const variableModifiers = {
  const: (state: VariableState): VariableState => ({ ...state, const: true }),
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
    this.compartment = compartment;
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
          kind,
          isConst: this.const ?? false,
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
                    kind: "set",
                    initial: { text: formulaOrRule },
                  },
        });
      }

      // eslint-disable-next-line
      return Object.assign(Object.create(variableProto), {
        kind,
        isConst: this.const ?? false,
      });
    },
  );
};

export const species = createVariableFunc("species");

export const parameter = createVariableFunc("parameter");

export const compartment = createVariableFunc("compartment");

export const reaction = (
  reactants: Record<string, number>,
  products: Record<string, number>,
  rate: string,
  extra?: object,
) => {
  return {
    reactants: Object.entries(reactants).map(([name, stoichiometry]) => ({
      name,
      stoichiometry,
    })),
    products: Object.entries(products).map(([name, stoichiometry]) => ({
      name,
      stoichiometry,
    })),
    rate: {
      text: rate,
    },
    ...extra,
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
      trigger: { text: trigger },
      assignments: newAssignments,
      options: {},
    };
  }
};
