import { FormulaContext } from "../generated/AntimonyParser";

export type AntimonyModel = {
  name: string;
  variables: Map<string, AntimonyVariable>;
  reactions: Map<string, AntimonyReaction>;
  events: AntimonyEvent[];
};

// TODO: "rate" rule should be separate since you should be able to set the initial value AND the rate rule
export type AntimonyAssignment = {
  kind: "set" | "rule" | "rate";
  formula: FormulaContext;
};

export type VariableKind = "species" | "parameter" | "compartment";

// TODO: units
export type AntimonyVariable = {
  kind: VariableKind;
  name: string;
  isConst: boolean;
  assignment?: AntimonyAssignment;
};

export type AntimonyReactionTerm = {
  name: string;
  stoichiometry: number;
};

export type AntimonyEvent = {
  trigger: FormulaContext;
  assignments: Map<string, FormulaContext>;
  delay?: FormulaContext;
};

export type AntimonyReaction = {
  name: string;
  reactants: AntimonyReactionTerm[];
  products: AntimonyReactionTerm[];
  rate?: FormulaContext;
};
