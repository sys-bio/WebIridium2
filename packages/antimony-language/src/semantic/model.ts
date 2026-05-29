import { FormulaContext } from "../generated/AntimonyParser";

export type AntimonyModel = {
  name: string;
  variables: Map<string, AntimonyVariable>;
  reactions: Map<string, AntimonyReaction>;
  events: Map<string, AntimonyEvent>;
};

export type AntimonySetAssignment = { kind: "set"; initial: FormulaContext };
export type AntimonyRuleAssignment = { kind: "rule"; rule: FormulaContext };
export type AntimonyRateAssignment = {
  kind: "rate";
  rate: FormulaContext;
  initial?: FormulaContext;
};
export type AntimonyAssignment =
  | AntimonySetAssignment
  | AntimonyRuleAssignment
  | AntimonyRateAssignment;

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
  name: string;
  trigger: FormulaContext;
  assignments: Map<string, FormulaContext>;
  delay?: FormulaContext;
  options: Record<string, FormulaContext | undefined>;
};

export type AntimonyReaction = {
  name: string;
  reactants: AntimonyReactionTerm[];
  products: AntimonyReactionTerm[];
  rate?: FormulaContext;
};
