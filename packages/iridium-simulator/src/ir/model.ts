import type { IridiumExpression } from "./ast";

export type IridiumModel = {
  parameters: IridiumParameter[];
  species: IridiumSpecies[];
  reactions: IridiumReaction[];
  events: IridiumEvent[];
};

export type IridiumParameter = {
  name: string;
  assignment: IridiumAssignment;
};

export type IridiumAssignment =
  | { kind: "initial"; initial: number }
  | { kind: "rate"; initial: number; rate: IridiumExpression }
  | { kind: "rule"; expr: IridiumExpression };

export type IridiumSpecies =
  | { isConst: false; name: string; assignment: Extract<IridiumAssignment, { kind: "initial" }> }
  | { isConst: true; name: string; assignment: IridiumAssignment };

export type IridiumReactionTerm = {
  name: string;
  stoichiometry: number;
};

export type IridiumReaction = {
  name: string;
  reactants: IridiumReactionTerm[];
  products: IridiumReactionTerm[];
  rate: IridiumExpression;
}

export type IridiumEventAssignment = {
  name: string;
  value: IridiumExpression;
};

export type IridiumEvent = {
  name: string;
  trigger: IridiumExpression;
  assignments: IridiumEventAssignment[];
  delay?: IridiumExpression;
  priority?: IridiumExpression;
  isT0: boolean;
  isPersistent: boolean;
  isFromTrigger: boolean;
}
