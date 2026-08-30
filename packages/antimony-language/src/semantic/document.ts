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

export type AntimonyDeleteable = {
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

/**
 * Represents an absolute path.
 * For example "A.S" is equivalent to the reference `["A", "S"]`.
 * A number refers to the index in the unnamedImports of a model.
 */
export type AntimonyReference = ReadonlyArray<string | number>;

export type AntimonyFormula = {
  scope: AntimonyReference | null;
  ctx: FormulaContext;
};

export type AntimonyStoichiometry = {
  scope: AntimonyReference | null;
  ctx: StoichiometryContext;
};

export type AntimonyModel = AntimonyObjectBase<"model"> & {
  parent?: AntimonyModel;
  objects: Map<string, AntimonyModelObject>;
  /** These are models that were imported without a name. */
  unnamedImports: AntimonyModel[];
  exports?: AntimonyReference[];
};

export type AntimonyInitialAssignment = {
  kind: "initial";
  initial: AntimonyFormula;
};
export type AntimonyRuleAssignment = {
  kind: "rule";
  rule: AntimonyFormula;
};
export type AntimonyRateAssignment = {
  kind: "rate";
  rate: AntimonyFormula;
  initial?: AntimonyFormula;
};

export type AntimonyAssignment =
  | AntimonyInitialAssignment
  | AntimonyRuleAssignment
  | AntimonyRateAssignment;

export type VariableKind = "species" | "parameter" | "compartment";

// TODO: units
export type AntimonyVariable = AntimonyObjectBase<"variable"> &
  AntimonyDeleteable & {
    variableKind: VariableKind;
    compartment: AntimonyReference | null;
    isConst: boolean;
    hasSubstanceOnly: boolean;
    assignment?: AntimonyAssignment;
  };

export type AntimonyReactionTerm = {
  reference: AntimonyReference;
  stoichiometry?: AntimonyStoichiometry;
};

export type AntimonyEvent = AntimonyObjectBase<"event"> &
  AntimonyDeleteable & {
    compartment: AntimonyReference | null;
    trigger?: AntimonyFormula;
    assignments: Map<AntimonyReference, AntimonyFormula>;
    delay?: AntimonyFormula;
    options: Record<string, AntimonyFormula | undefined>;
  };

export type AntimonyReaction = AntimonyObjectBase<"reaction"> &
  AntimonyDeleteable & {
    compartment: AntimonyReference | null;
    reactants: AntimonyReactionTerm[];
    products: AntimonyReactionTerm[];
    rate?: AntimonyFormula;
  };

export type AntimonyFunction = AntimonyObjectBase<"function"> & {
  parameters: string[];
  // not using AntimonyFormula here since we don't need scope
  body: FormulaContext;
};

export type AntimonyRenameLink = AntimonyObjectBase<"renameLink"> & {
  to: AntimonyReference;
};
