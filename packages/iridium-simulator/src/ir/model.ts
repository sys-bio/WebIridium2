import type { IridiumExpression } from "./ast";

export type IridiumModel<Metadata = unknown> = {
  variables: IridiumVariable<Metadata>[];
  compartments: IridiumCompartment[];
  reactions: IridiumReaction<Metadata>[];
  events: IridiumEvent<Metadata>[];
};

export type IridiumVariableValue<Metadata = unknown> =
  | { kind: "initial"; initial: IridiumExpression<Metadata> }
  /** This means the value of the variable is determined by a reaction + initial value. */
  | { kind: "reaction"; initial: IridiumExpression<Metadata> }
  | {
      kind: "rate";
      initial: IridiumExpression<Metadata>;
      rate: IridiumExpression<Metadata>;
    }
  | { kind: "assignment"; assignment: IridiumExpression<Metadata> };

export type IridiumVariable<Metadata = unknown> = {
  name: string;
  value: IridiumVariableValue<Metadata>;
  hasSubstanceOnly: boolean;
  metadata?: Metadata;
};

export type IridiumCompartment = {
  containerVariable: string;
  containedVariables: string[];
};

export type IridiumReactionTerm<Metadata = unknown> = {
  name: string;
  stoichiometry: number;
  metadata?: Metadata;
};

export type IridiumReaction<Metadata = unknown> = {
  name: string;
  reactants: IridiumReactionTerm<Metadata>[];
  products: IridiumReactionTerm<Metadata>[];
  rate: IridiumExpression<Metadata>;
  metadata?: Metadata;
};

export type IridiumEventAssignment<Metadata = unknown> = {
  name: string;
  value: IridiumExpression<Metadata>;
  metadata?: Metadata;
};

export type IridiumEvent<Metadata = unknown> = {
  name: string;
  trigger: IridiumExpression<Metadata>;
  assignments: IridiumEventAssignment<Metadata>[];
  delay?: IridiumExpression<Metadata>;
  priority?: IridiumExpression<Metadata>;
  isT0: boolean;
  isPersistent: boolean;
  isFromTrigger: boolean;
  metadata?: Metadata;
};
