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
  displayName?: string;
};

export type AntimonyDeleteableBase<Kind extends string> =
  AntimonyObjectBase<Kind> & {
    isDeleted: boolean;
  };

export type AntimonyObject =
  | AntimonyModel
  | AntimonyVariable
  | AntimonyEvent
  | AntimonyReaction
  | AntimonyFunction
  | AntimonyRenameLink;

/** Objects that can be contained within models. */
export type AntimonyModelObject = Exclude<AntimonyObject, { kind: "function" }>;

/** Anything that is not a link. */
export type AntimonyConcreteObject = Exclude<
  AntimonyObject,
  { kind: "renameLink" }
>;

export const PARENT_SYMBOL = Symbol("parent");
export type PARENT_SYMBOL = typeof PARENT_SYMBOL;

/**
 * Represents a relative path.
 * For example "A.S" is equivalent to the reference `["A", "S"]`
 */
export type AntimonyReference = ReadonlyArray<string | PARENT_SYMBOL>;

export type AntimonyModel = AntimonyObjectBase<"model"> & {
  parent?: AntimonyModel;
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
export type AntimonyVariable = AntimonyDeleteableBase<"variable"> & {
  variableKind: VariableKind;
  compartment: AntimonyReference | null;
  isConst: boolean;
  hasSubstanceOnly: boolean;
  assignment?: AntimonyAssignment;
};

export type AntimonyReactionTerm = {
  reference: AntimonyReference;
  stoichiometry?: StoichiometryContext;
};

export type AntimonyEvent = AntimonyDeleteableBase<"event"> & {
  compartment: AntimonyReference | null;
  trigger: FormulaContext;
  assignments: Map<AntimonyReference, FormulaContext>;
  delay?: FormulaContext;
  options: Record<string, FormulaContext | undefined>;
};

export type AntimonyReaction = AntimonyDeleteableBase<"reaction"> & {
  compartment: AntimonyReference | null;
  reactants: AntimonyReactionTerm[];
  products: AntimonyReactionTerm[];
  rate?: FormulaContext;
};

export type AntimonyFunction = AntimonyObjectBase<"function"> & {
  parameters: string[];
  body: FormulaContext;
};

export type AntimonyRenameLink = AntimonyObjectBase<"renameLink"> & {
  to: AntimonyReference;
};
