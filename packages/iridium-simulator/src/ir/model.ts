import type { IridiumExpression } from "./ast";

export type IridiumModel<Metadata = unknown> = {
  parameters: IridiumParameter<Metadata>[];
  species: IridiumSpecies<Metadata>[];
  compartments: IridiumCompartment<Metadata>[];
  reactions: IridiumReaction<Metadata>[];
  events: IridiumEvent<Metadata>[];
};

export type IridiumParameterValue<Metadata = unknown> =
  | { kind: "initial"; initial: IridiumExpression<Metadata> }
  | {
      kind: "rate";
      initial: IridiumExpression<Metadata>;
      rate: IridiumExpression<Metadata>;
    }
  | { kind: "assignment"; assignment: IridiumExpression<Metadata> };

export type IridiumParameter<Metadata = unknown> = {
  name: string;
  value: IridiumParameterValue<Metadata>;
  metadata?: Metadata;
};

export type IridiumSpecies<Metadata = unknown> = {
  name: string;
  initial: IridiumExpression<Metadata>;
  metadata?: Metadata;
};

export type IridiumCompartment = {
  parameter: string;
  variables: string[];
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
