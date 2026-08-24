import {
  FormulaContext,
  StoichiometryContext,
} from "../generated/AntimonyParser";

export type AntimonyDocument = {
  models: Map<string, AntimonyModel>;
  functions: Map<string, AntimonyFunction>;
  exportedModel: string;
};

export type AntimonyObjectBase<Kind extends string> = {
  kind: Kind;
  name: string;
};

export type AntimonyObject =
  | AntimonyModel
  | AntimonyVariable
  | AntimonyEvent
  | AntimonyReaction
  | AntimonyFunction;

/** Objects that can be contained within models. */
export type AntimonyModelObject = Exclude<AntimonyObject, { kind: "function" }>;

/**
 * Represents a relative path.
 * For example "A.S" is equivalent to the reference `["A", "S"]`
 */
export type AntimonyReference = string[];

export type AntimonyModel = AntimonyObjectBase<"model"> & {
  objects: Map<string, AntimonyModelObject>;
  /** These are models that were imported without a name. */
  unnamedImports: AntimonyModel[];
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
  compartment: AntimonyReference | null;
  isConst: boolean;
  hasSubstanceOnly: boolean;
  assignment?: AntimonyAssignment;
};

export type AntimonyReactionTerm = {
  /**
   * A relative path starting from the parent model.
   * For example, the term "A.S" will have a path `["A", "S"]`.
   */
  reference: AntimonyReference;
  stoichiometry?: StoichiometryContext;
};

export type AntimonyEvent = AntimonyObjectBase<"event"> & {
  compartment: AntimonyReference | null;
  trigger: FormulaContext;
  assignments: Record<string, FormulaContext>;
  delay?: FormulaContext;
  options: Record<string, FormulaContext | undefined>;
};

export type AntimonyReaction = AntimonyObjectBase<"reaction"> & {
  compartment: AntimonyReference | null;
  reactants: AntimonyReactionTerm[];
  products: AntimonyReactionTerm[];
  rate?: FormulaContext;
};

export type AntimonyFunction = AntimonyObjectBase<"function"> & {
  parameters: string[];
  body: FormulaContext;
};
