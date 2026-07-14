import type {
  IridiumEvent,
  IridiumModel,
  IridiumParameter,
  IridiumSpecies,
  IridiumReaction,
  IridiumReactionTerm,
} from "./model";
import type { IridiumExpression } from "./ast";

type DslSpecies = Omit<IridiumSpecies, "name">;
type DslParameter = Omit<IridiumParameter, "name">;
type DslReaction = Omit<IridiumReaction, "name">;
type DslEvent = Omit<IridiumEvent, "name">;
type DslExpression = IridiumExpression;

export const model = (parts: {
  species?: { [name: string]: DslSpecies };
  parameters?: { [name: string]: DslParameter };
  reactions?: { [name: string]: DslReaction };
  events?: { [name: string]: DslEvent };
}): IridiumModel => {
  const model = {
    species: Object.entries(parts?.species ?? {}).map(([name, data]) => ({
      name,
      ...data,
    })),

    parameters: Object.entries(parts?.parameters ?? {}).map(([name, data]) => ({
      name,
      ...data,
    })),

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
): DslSpecies => {
  if (typeof initialAssignment === "number") {
    return {
      initial: { kind: "number", value: initialAssignment },
      metadata: metadata,
    };
  } else {
    return {
      initial: initialAssignment,
      metadata: metadata,
    };
  }
};

export const parameter = <T = unknown>(
  initialAssignment: number | IridiumExpression,
  metadata?: T,
): DslParameter => {
  if (typeof initialAssignment === "number") {
    return {
      value: {
        kind: "initial",
        initial: { kind: "number", value: initialAssignment },
      },
      metadata: metadata,
    };
  } else {
    return {
      value: {
        kind: "initial",
        initial: initialAssignment,
      },
      metadata: metadata,
    };
  }
};

export const reaction = <T = unknown>(
  reactants: { [name: string]: number },
  products: { [name: string]: number },
  rate: DslExpression,
  metadata?: T,
): DslReaction => {
  const outReactants: IridiumReactionTerm<T>[] = [];
  const outProducts: IridiumReactionTerm<T>[] = [];

  for (const [name, stoichiometry] of Object.entries(reactants)) {
    outReactants.push({ name, stoichiometry });
  }

  for (const [name, stoichiometry] of Object.entries(products)) {
    outProducts.push({ name, stoichiometry });
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
