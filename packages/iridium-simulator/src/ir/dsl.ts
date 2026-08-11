import type {
  IridiumEvent,
  IridiumModel,
  IridiumVariable,
  IridiumReaction,
  IridiumReactionTerm,
} from "./model";
import type { IridiumExpression } from "./ast";

export type DslVariable = Omit<IridiumVariable, "name">;
export type DslReaction = Omit<IridiumReaction, "name">;
export type DslEvent = Omit<IridiumEvent, "name">;
export type DslExpression = IridiumExpression;

export const model = (parts: {
  variables: { [name: string]: DslVariable };
  compartments?: { [name: string]: string[] };
  reactions?: { [name: string]: DslReaction };
  events?: { [name: string]: DslEvent };
}): IridiumModel => {
  const model = {
    variables: Object.entries(parts?.variables ?? {}).map(([name, data]) => ({
      name,
      ...data,
    })),

    compartments: Object.entries(parts?.compartments ?? {}).map(
      ([name, data]) => ({
        containerVariable: name,
        containedVariables: data,
      }),
    ),

    reactions: Object.entries(parts?.reactions ?? {}).map(([name, data]) => ({
      name,
      ...data,
    })),

    events: Object.entries(parts?.events ?? {}).map(([name, data]) => ({
      name,
      ...data,
    })),
  };

  return model;
};

export const species = <T = unknown>(
  initialAssignment: number | IridiumExpression,
  metadata?: T,
): DslVariable => {
  if (typeof initialAssignment === "number") {
    return {
      value: {
        kind: "reaction",
        initial: { kind: "number", value: initialAssignment },
      },
      hasSubstanceOnly: false,
      metadata: metadata,
    };
  } else {
    return {
      value: {
        kind: "reaction",
        initial: initialAssignment,
      },
      hasSubstanceOnly: false,
      metadata: metadata,
    };
  }
};

export const parameter = <T = unknown>(
  initialAssignment: number | IridiumExpression,
  metadata?: T,
): DslVariable => {
  if (typeof initialAssignment === "number") {
    return {
      value: {
        kind: "initial",
        initial: { kind: "number", value: initialAssignment },
      },
      hasSubstanceOnly: false,
      metadata: metadata,
    };
  } else {
    return {
      value: {
        kind: "initial",
        initial: initialAssignment,
      },
      hasSubstanceOnly: false,
      metadata: metadata,
    };
  }
};

export const reaction = <T = unknown>(
  reactants: { [name: string]: number | IridiumExpression<T> },
  products: { [name: string]: number | IridiumExpression<T> },
  rate: DslExpression,
  metadata?: T,
): DslReaction => {
  const outReactants: IridiumReactionTerm<T>[] = [];
  const outProducts: IridiumReactionTerm<T>[] = [];

  for (const [name, stoichiometry] of Object.entries(reactants)) {
    outReactants.push({
      name,
      stoichiometry:
        typeof stoichiometry === "number"
          ? { kind: "number", value: stoichiometry }
          : stoichiometry,
    });
  }

  for (const [name, stoichiometry] of Object.entries(products)) {
    outProducts.push({
      name,
      stoichiometry:
        typeof stoichiometry === "number"
          ? { kind: "number", value: stoichiometry }
          : stoichiometry,
    });
  }

  return {
    reactants: outReactants,
    products: outProducts,
    rate: rate,
    metadata: metadata,
  };
};

export const event = <T = unknown>(
  trigger: IridiumExpression<T>,
  assignments: { [name: string]: IridiumExpression<T> },
  options?: {
    delay?: IridiumExpression<T>;
    priority?: IridiumExpression<T>;
    isT0: boolean;
    isPersistent: boolean;
    isFromTrigger: boolean;
    metadata?: T;
  },
): DslEvent => {
  return {
    trigger,
    assignments: Object.entries(assignments).map(([name, value]) => ({
      name,
      value,
    })),
    isT0: true,
    isPersistent: true,
    isFromTrigger: true,
    ...options,
  };
};

export const expr = {
  num: <T = unknown>(value: number, metadata?: T): IridiumExpression<T> => ({
    kind: "number",
    value,
    metadata,
  }),
  var: <T = unknown>(name: string, metadata?: T): IridiumExpression<T> => ({
    kind: "variable",
    name,
    metadata,
  }),
  add: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "add",
    left,
    right,
    metadata,
  }),
  sub: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "sub",
    left,
    right,
    metadata,
  }),
  mul: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "mul",
    left,
    right,
    metadata,
  }),
  div: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "div",
    left,
    right,
    metadata,
  }),
  mod: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "mod",
    left,
    right,
    metadata,
  }),
  pow: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "pow",
    left,
    right,
    metadata,
  }),
  and: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "and",
    left,
    right,
    metadata,
  }),
  or: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "or",
    left,
    right,
    metadata,
  }),
  eq: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "eq",
    left,
    right,
    metadata,
  }),
  neq: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "neq",
    left,
    right,
    metadata,
  }),
  ge: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "ge",
    left,
    right,
    metadata,
  }),
  gt: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "gt",
    left,
    right,
    metadata,
  }),
  le: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "le",
    left,
    right,
    metadata,
  }),
  lt: <T = unknown>(
    left: IridiumExpression<T>,
    right: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({
    kind: "binary",
    op: "lt",
    left,
    right,
    metadata,
  }),
  neg: <T = unknown>(
    expr: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({ kind: "unary", op: "neg", expr, metadata }),
  not: <T = unknown>(
    expr: IridiumExpression<T>,
    metadata?: T,
  ): IridiumExpression<T> => ({ kind: "unary", op: "not", expr, metadata }),
  call: <T = unknown>(
    name: string,
    args: IridiumExpression<T>[],
    metadata?: T,
  ): IridiumExpression<T> => ({ kind: "call", name, args, metadata }),
} as const;
