import { FormulaContext } from "../generated/AntimonyParser";

export type AntimonyModel = {
  name: string;
  variables: Map<string, AntimonyVariable>;
  reactions: Map<string, AntimonyReaction>;
  events: AntimonyEvent[];
};

export type AntimonyAssignment = {
  kind: "set" | "rule" | "rate";
  formula: FormulaContext;
};

export type VariableKind = "species" | "parameter";

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
  assignments: AntimonyEventAssignment[];
};

export type AntimonyEventAssignment = {
  name: string;
  formula: FormulaContext;
};

export type AntimonyReaction = {
  name: string;
  reactants: AntimonyReactionTerm[];
  products: AntimonyReactionTerm[];
  rate?: FormulaContext;
};
