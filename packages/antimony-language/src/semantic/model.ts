import {
  FormulaContext,
  StoichiometryContext,
} from "../generated/AntimonyParser";

export type AntimonyObjectBase<Kind extends string> = {
  kind: Kind;
  name: string;
};

export type AntimonyObject =
  | AntimonyModel
  | AntimonyVariable
  | AntimonyEvent
  | AntimonyReaction;

/** Objects that can be contained within models. */
export type AntimonyModelObject = Exclude<AntimonyObject, { kind: "model" }>;

export type AntimonyModel = AntimonyObjectBase<"model"> & {
  objects: Map<string, Exclude<AntimonyObject, { kind: "model" }>>;
};

export type AntimonyInitialAssignment = {
  kind: "initial";
  initial: FormulaContext;
};
export type AntimonyRuleAssignment = { kind: "rule"; rule: FormulaContext };
export type AntimonyRateAssignment = {
  kind: "rate";
  rate: FormulaContext;
  initial?: FormulaContext;
};

export type AntimonyAssignment =
  | AntimonyInitialAssignment
  | AntimonyRuleAssignment
  | AntimonyRateAssignment;

export type VariableKind = "species" | "parameter" | "compartment";

// TODO: units
export type AntimonyVariable = AntimonyObjectBase<"variable"> & {
  variableKind: VariableKind;
  displayName?: string;
  compartment: string | null;
  isConst: boolean;
  hasSubstanceOnly: boolean;
  assignment?: AntimonyAssignment;
};

export type AntimonyReactionTerm = {
  name: string;
  stoichiometry?: StoichiometryContext;
};

export type AntimonyEvent = AntimonyObjectBase<"event"> & {
  compartment: string | null;
  trigger: FormulaContext;
  assignments: Record<string, FormulaContext>;
  delay?: FormulaContext;
  options: Record<string, FormulaContext | undefined>;
};

export type AntimonyReaction = AntimonyObjectBase<"reaction"> & {
  compartment: string | null;
  reactants: AntimonyReactionTerm[];
  products: AntimonyReactionTerm[];
  rate?: FormulaContext;
};

export type AntimonyFunction = AntimonyObjectBase<"function"> & {
  parameters: string[];
  body: FormulaContext;
};
