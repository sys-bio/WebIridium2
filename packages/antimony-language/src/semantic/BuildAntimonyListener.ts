import { SemanticError } from "../errors";
import type { AntimonyListener } from "../generated/AntimonyListener";
import { ParserRuleContext } from "antlr4ts";
import {
  AssignmentContext,
  ConstantContext,
  DeclarationContext,
  DeclarationNameContext,
  DeleteContext,
  EventContext,
  FormulaContext,
  FunctionDefinitionContext,
  InCompartmentContext,
  InStatementContext,
  ModelContext,
  ModelImportContext,
  NameContext,
  NameLabelContext,
  ReactantListContext,
  ReactionContext,
  RenameContext,
  StoichiometryContext,
  StringContext,
  SubvariableContext,
  VarContext,
  VariableAnnotationContext,
  VariableContext,
} from "../generated/AntimonyParser";
import {
  type AntimonyVariable,
  type AntimonyModel,
  type AntimonyReactionTerm,
  type VariableKind,
  type AntimonyObject,
  type AntimonyModelObject,
  type AntimonyReference,
  type AntimonyDocument,
  type AntimonyConcreteObject,
  type AntimonyFormula,
  type AntimonyStoichiometry,
} from "./document";
import { isBuiltinName, builtinEventOptions } from "./builtins";

type DeclarationState = {
  kind?: VariableKind;
  isConst?: boolean;
  hasSubstanceOnly?: boolean;
};

const ALLOWED_DECLARATIONS = new Set<VariableKind>(["species", "compartment"]);

export const DEFAULT_COMPARTMENT_NAME = "default_compartment";
export const DEFAULT_MODEL_NAME = "__main";
export const DEFAULT_IMPORT_PREFIX = "_sys";

const prependScope = (
  formula: { scope: AntimonyReference | null },
  prefix: string | number,
): void => {
  if (formula.scope) {
    formula.scope = [prefix, ...formula.scope];
  } else {
    formula.scope = [prefix];
  }
};

const prependCompartment = (
  object: { compartment: AntimonyReference | null },
  prefix: string | number,
): void => {
  if (object.compartment) {
    object.compartment = [prefix, ...object.compartment];
  }
};

/**
 * Copies an AntimonyObject and prepends a string to every reference.
 * Used in model imports.
 */
const copyAntimonyObject = (
  object: AntimonyModelObject,
  referencePrefix: string | number,
): AntimonyModelObject => {
  switch (object.kind) {
    case "model": {
      const copy: AntimonyModel = {
        ...object,
        objects: new Map(),
        unnamedImports: [],
      };

      for (const [name, subobject] of object.objects) {
        const subobjectCopy = copyAntimonyObject(subobject, referencePrefix);
        if (subobjectCopy.kind === "model") {
          subobjectCopy.parent = copy;
        }
        copy.objects.set(name, subobjectCopy);
      }

      for (const submodel of object.unnamedImports) {
        const submodelCopy = copyAntimonyObject(
          submodel,
          referencePrefix,
        ) as AntimonyModel;
        submodelCopy.parent = copy;
        copy.unnamedImports.push(submodelCopy);
      }

      return copy;
    }
    case "variable": {
      const copy = { ...object };

      prependCompartment(copy, referencePrefix);

      if (object.assignment) {
        copy.assignment = { ...object.assignment };

        if (copy.assignment.kind === "initial") {
          copy.assignment.initial = { ...copy.assignment.initial };
          prependScope(copy.assignment.initial, referencePrefix);
        } else if (copy.assignment.kind === "rule") {
          copy.assignment.rule = { ...copy.assignment.rule };
          prependScope(copy.assignment.rule, referencePrefix);
        } else if (copy.assignment.kind === "rate") {
          if (copy.assignment.initial) {
            copy.assignment.initial = { ...copy.assignment.initial };
            prependScope(copy.assignment.initial, referencePrefix);
          }
          copy.assignment.rate = { ...copy.assignment.rate };
          prependScope(copy.assignment.rate, referencePrefix);
        }
      }

      return copy;
    }
    case "reaction": {
      const copy = { ...object };

      prependCompartment(copy, referencePrefix);

      if (copy.rate) {
        copy.rate = { ...copy.rate };
        prependScope(copy.rate, referencePrefix);
      }

      const newReactants = [];
      for (const reactant of copy.reactants) {
        const newReactant = { ...reactant };
        if (newReactant.stoichiometry) {
          newReactant.stoichiometry = { ...newReactant.stoichiometry };
          prependScope(newReactant.stoichiometry, referencePrefix);
        }
        newReactant.reference = [referencePrefix, ...newReactant.reference];
        newReactants.push(newReactant);
      }
      copy.reactants = newReactants;

      const newProducts = [];
      for (const product of copy.products) {
        const newProduct = { ...product };
        if (newProduct.stoichiometry) {
          newProduct.stoichiometry = { ...newProduct.stoichiometry };
          prependScope(newProduct.stoichiometry, referencePrefix);
        }
        newProduct.reference = [referencePrefix, ...newProduct.reference];
        newProducts.push(newProduct);
      }
      copy.products = newProducts;

      return copy;
    }
    case "event": {
      const copy = { ...object };

      prependCompartment(copy, referencePrefix);

      if (copy.trigger) {
        copy.trigger = { ...copy.trigger };
        prependScope(copy.trigger, referencePrefix);
      }

      if (copy.delay) {
        copy.delay = { ...copy.delay };
        prependScope(copy.delay, referencePrefix);
      }

      const newAssignments = new Map<AntimonyReference, AntimonyFormula>();
      for (const [reference, assignment] of copy.assignments) {
        const assignmentCopy = { ...assignment };
        prependScope(assignmentCopy, referencePrefix);
        newAssignments.set([referencePrefix, ...reference], assignmentCopy);
      }
      copy.assignments = newAssignments;

      const newOptions = { ...copy.options };
      for (const [name, option] of Object.entries(copy.options)) {
        if (option) {
          const optionCopy = { ...option };
          prependScope(optionCopy, referencePrefix);
          newOptions[name] = optionCopy;
        }
      }
      copy.options = newOptions;

      return copy;
    }
    case "renameLink":
      return { ...object, to: [referencePrefix, ...object.to] };
  }
};

const referenceToString = (reference: AntimonyReference) => reference.join(".");

export const getReferenceFromVariable = (
  variable: VariableContext,
): AntimonyReference => {
  const reference = [];
  let current = variable;

  while (true) {
    if (current instanceof NameContext) {
      reference.push(current.NAME().text);
      break;
    } else if (current instanceof SubvariableContext) {
      reference.push(current.NAME().text);
      current = current.variable();
    } else if (current instanceof ConstantContext) {
      current = current.variable();
    } else {
      throw new Error(`Unknown variable type: ${variable}.`);
    }
  }

  reference.reverse();

  return reference;
};

const getReferenceFromNameLabel = (nameLabel: NameLabelContext) => {
  return nameLabel.NAME().map((v) => v.text);
};

type ObjectWithModelInfo = [
  model: AntimonyModel,
  name: string | number,
  obj: AntimonyConcreteObject,
];

// This one doesn't point to a model so name can't be a number
type ModelObjectWithModelInfo = [
  model: AntimonyModel,
  name: string,
  obj: AntimonyConcreteObject | undefined,
];

/**
 * If the object is a renameLink, follow it. Otherwise, return the object.
 */
const resolveObjectWithModelInfo = (
  rootModel: AntimonyModel,
  object: AntimonyObject,
  containingModel: AntimonyModel,
): ObjectWithModelInfo => {
  return object?.kind === "renameLink"
    ? resolveReferenceWithModelInfo(rootModel, object.to)
    : [containingModel, object.name, object];
};

export class BadReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadReferenceError";
  }
}

const resolveReferenceWithModelInfo = (
  rootModel: AntimonyModel,
  reference: AntimonyReference,
  startModel?: AntimonyModel,
): ObjectWithModelInfo => {
  let parent: AntimonyModel = startModel ?? rootModel;
  let current: AntimonyObject = startModel ?? rootModel;

  for (const name of reference) {
    if (current.kind !== "model") {
      throw new BadReferenceError(
        `Cannot access ${current.name} in ${referenceToString(reference)} because it is not a model.`,
      );
    }

    let got: AntimonyObject | undefined =
      typeof name === "number"
        ? current.unnamedImports[name]
        : current.objects.get(name);

    if (!got) {
      throw new BadReferenceError(
        `${name} is not a subvariable of ${current.name}.`,
      );
    }

    parent = current;
    current = got;
  }

  return resolveObjectWithModelInfo(rootModel, current, parent);
};

/**
 * @param rootModel - where any links are resolved from
 * @param reference - reference to resolve
 * @param startModel - an optional model where the reference should start at
 */
export const resolveReference = (
  rootModel: AntimonyModel,
  reference: AntimonyReference,
  startModel?: AntimonyModel,
): AntimonyConcreteObject => {
  const [_model, _name, object] = resolveReferenceWithModelInfo(
    rootModel,
    reference,
    startModel,
  );
  return object;
};

const createReference = (
  model: AntimonyModel,
  childName?: string,
): AntimonyReference => {
  const reference = [];

  let current = model.parent;
  let child = model;
  while (current) {
    if (current.objects.has(child.name)) {
      reference.push(child.name);
    } else {
      const index = current.unnamedImports.indexOf(model);
      if (index < 0) {
        throw new Error(
          `${child.name} nowhere to be found inside ${model.name}.`,
        );
      }
      reference.push(index);
    }

    child = current;
    current = current.parent;
  }

  reference.reverse();

  if (childName !== undefined) {
    reference.push(childName);
  }

  return reference;
};

const isRenameable = (object: AntimonyObject): object is AntimonyModelObject =>
  object.kind === "variable" ||
  object.kind === "reaction" ||
  object.kind === "event";

/**
 * Builds Antimony models from a parse tree.
 */
export class BuildAntimonyListener implements AntimonyListener {
  #baseModel: AntimonyModel;
  #document: AntimonyDocument;
  #currentModel: AntimonyModel | undefined;
  #currentDeclaration: DeclarationState | undefined;

  #diagnostics?: Error[];

  constructor({ diagnostics }: { diagnostics?: Error[] } = {}) {
    this.#document = {
      models: new Map(),
      exportedModel: DEFAULT_MODEL_NAME,
      functions: new Map(),
    };
    this.#baseModel = {
      kind: "model",
      name: DEFAULT_MODEL_NAME,
      objects: new Map(),
      unnamedImports: [],
    };
    this.#document.models.set(DEFAULT_MODEL_NAME, this.#baseModel);
    this.#document.exportedModel = DEFAULT_MODEL_NAME;

    this.#diagnostics = diagnostics;
  }

  getDocument(): AntimonyDocument {
    let exported = this.#document.exportedModel;
    if (exported === DEFAULT_MODEL_NAME) {
      const defaultModel = this.#document.models.get(DEFAULT_MODEL_NAME)!;
      // if the top-level model is empty then try to pick the last model instead
      if (
        defaultModel.objects.size === 0 &&
        defaultModel.unnamedImports.length === 0 &&
        this.#document.models.size > 1
      ) {
        const models = Array.from(this.#document.models.values());
        exported = models[models.length - 1].name;
      }
    }

    return {
      ...this.#document,
      exportedModel: exported,
    };
  }

  #reportError(message: string, tree: ParserRuleContext): void {
    const error = new SemanticError(message, { tree });
    if (this.#diagnostics) {
      this.#diagnostics.push(error);
    } else {
      throw error;
    }
  }

  get #isActive(): boolean {
    return true;
  }

  #getActiveModel(): AntimonyModel {
    if (!this.#currentModel) {
      return this.#baseModel;
    }
    return this.#currentModel;
  }

  #createFormula(formula: FormulaContext): AntimonyFormula;
  #createFormula(
    formula: FormulaContext | undefined,
  ): AntimonyFormula | undefined;
  #createFormula(
    formula: FormulaContext | undefined,
  ): AntimonyFormula | undefined {
    if (formula === undefined) return undefined;

    const model = this.#getActiveModel();
    if (model.parent) {
      return { scope: createReference(model), ctx: formula };
    } else {
      return { scope: null, ctx: formula };
    }
  }

  #createStoichiometry(
    stoichiometry: StoichiometryContext,
  ): AntimonyStoichiometry;
  #createStoichiometry(
    stoichiometry: StoichiometryContext | undefined,
  ): AntimonyStoichiometry | undefined;
  #createStoichiometry(
    stoichiometry: StoichiometryContext | undefined,
  ): AntimonyStoichiometry | undefined {
    if (stoichiometry === undefined) return undefined;

    const model = this.#getActiveModel();
    if (model.parent) {
      return { scope: createReference(model), ctx: stoichiometry };
    } else {
      return { scope: null, ctx: stoichiometry };
    }
  }

  /** returns true on success. */
  #setObject(
    model: AntimonyModel,
    name: string,
    object: AntimonyModelObject,
    ctx: ParserRuleContext,
  ): boolean {
    const existing = model.objects.get(name);
    if (existing) {
      if (existing.kind !== object.kind) {
        if (
          existing.kind !== "variable" ||
          existing.variableKind !== "parameter"
        ) {
          this.#reportError(
            `Cannot assign to ${name} with a ${object.kind} because it is already a ${existing.kind}.`,
            ctx,
          );
          return false;
        } else if (
          existing.assignment &&
          existing.assignment.kind !== "initial"
        ) {
          this.#reportError(
            `Cannot assign to ${name} with a ${object.kind} because it already has an assignment.`,
            ctx,
          );
          return false;
        }
      }
    }

    model.objects.set(name, object);
    return true;
  }

  #setVariableKind(
    ctx: ParserRuleContext,
    variable: AntimonyVariable,
    kind: VariableKind,
  ): void {
    if (variable.variableKind === "species" && kind === "compartment") {
      this.#reportError(
        `Cannot convert ${variable.name} to compartment when it is a species.`,
        ctx,
      );
    }

    if (variable.variableKind === "compartment" && kind !== "compartment") {
      this.#reportError(
        `Cannot convert ${variable.name} from compartment.`,
        ctx,
      );
    }

    variable.variableKind = kind;
  }

  #getOrCreateCompartment(
    compartmentCtx: InCompartmentContext | undefined,
  ): AntimonyReference | null {
    if (!compartmentCtx) {
      return null;
    } else {
      const compartmentObject = this.#getOrCreateObject(
        compartmentCtx.variable(),
        undefined,
        "compartment",
      );

      if (!compartmentObject) {
        this.#reportError(
          "Cannot use built-in as a compartment",
          compartmentCtx,
        );
        return null;
      }

      if (compartmentObject.kind !== "variable") {
        this.#reportError(
          `${compartmentObject.name} of type ${compartmentObject.kind} cannot be used as a compartment.`,
          compartmentCtx,
        );
        return null;
      }

      this.#setVariableKind(compartmentCtx, compartmentObject, "compartment");

      return getReferenceFromVariable(compartmentCtx.variable());
    }
  }

  /**
   * This resolves a reference but with some special rules.
   *  - if the reference is exactly one item long and does not resolve to any
   *    object, undefined will be returned instead of throwing (subvariables
   *    will still throw if they don't exist).
   *  - function names will be resolved
   *  RenameLinks will still be resolved as usual.
   */
  #resolveReferenceForAssignment(
    rootModel: AntimonyModel,
    reference: AntimonyReference,
    ctx: ParserRuleContext,
  ): ModelObjectWithModelInfo {
    let parent: AntimonyModel = rootModel;
    let current: AntimonyObject = rootModel;

    for (let i = 0; i < reference.length; i++) {
      const name = reference[i];

      if (current.kind !== "model") {
        // TODO: actually implement this properly
        if (name === "sboTerm") {
          return [parent, current.name, undefined];
        }

        this.#reportError(
          `Cannot access object ${name} in ${referenceToString(reference)} because it is not a model.`,
          ctx,
        );
        return resolveObjectWithModelInfo(
          rootModel,
          current,
          parent,
        ) as ModelObjectWithModelInfo;
      }

      let got: AntimonyObject | undefined =
        typeof name === "number"
          ? current.unnamedImports[name]
          : current.objects.get(name);

      if (!got) {
        if (i === 0) {
          return [parent, name as string, undefined];
        } else {
          this.#reportError(
            `${name} is not a subvariable of ${current.name}.`,
            ctx,
          );
          return [parent, name as string, undefined];
        }
      }

      parent = current;
      current = got;
    }

    return resolveObjectWithModelInfo(
      rootModel,
      current,
      parent,
    ) as ModelObjectWithModelInfo;
  }

  #resolveVariable(
    rootModel: AntimonyModel,
    variableCtx: VariableContext,
  ): ModelObjectWithModelInfo {
    return this.#resolveReferenceForAssignment(
      rootModel,
      getReferenceFromVariable(variableCtx),
      variableCtx,
    );
  }

  /**
   * Get or create a variable and return it.
   * If the variable has the name of a built-in, does not create
   * the variable, instead returns undefined.
   */
  #getOrCreateObject(
    variableCtx: VariableContext,
    compartmentCtx: InCompartmentContext | undefined,
    defaultVariableKind?: VariableKind,
  ): AntimonyObject | undefined {
    if (variableCtx instanceof NameContext) {
      if (this.#document.functions.has(variableCtx.NAME().text)) {
        return this.#document.functions.get(variableCtx.NAME().text);
      }
    }

    let [model, name, object] = this.#resolveVariable(
      this.#getActiveModel(),
      variableCtx,
    );

    if (isBuiltinName(name)) {
      return undefined;
    }

    if (!object) {
      object = {
        kind: "variable",
        variableKind:
          defaultVariableKind ?? this.#currentDeclaration?.kind ?? "parameter",
        compartment: this.#getOrCreateCompartment(compartmentCtx),
        name: name,
        isDeleted: false,
        isConst:
          variableCtx instanceof ConstantContext ||
          (this.#currentDeclaration?.isConst ?? false),
        hasSubstanceOnly: false,
      };

      model.objects.set(object.name, object);
    } else if (compartmentCtx) {
      object.compartment = this.#getOrCreateCompartment(compartmentCtx);
    }

    if (object.kind === "variable" && variableCtx instanceof ConstantContext) {
      object.isConst = true;
    }

    return object;
  }

  #getOrDefaultReference(
    nameLabelCtx: NameLabelContext | undefined,
    prefix: string,
  ): { reference: AntimonyReference; compartment: AntimonyReference | null } {
    if (nameLabelCtx) {
      return {
        reference: getReferenceFromNameLabel(nameLabelCtx),
        compartment: this.#getOrCreateCompartment(nameLabelCtx.inCompartment()),
      };
    } else {
      let candidate: string;
      let i = 0;
      do {
        candidate = `${prefix}${i++}`;
      } while (this.#getActiveModel().objects.has(candidate));

      return { reference: [candidate], compartment: null };
    }
  }

  #updateToDeclarationIfNecessary(
    ctx: ParserRuleContext,
    object: AntimonyObject,
  ): void {
    if (this.#currentDeclaration) {
      if (
        object.kind === "variable" &&
        this.#currentDeclaration.isConst !== undefined
      ) {
        object.isConst = this.#currentDeclaration.isConst;
      }

      if (this.#currentDeclaration.kind !== undefined) {
        if (object.kind === "variable") {
          this.#setVariableKind(ctx, object, this.#currentDeclaration.kind);
        } else {
          this.#reportError(
            `${object.name} is a ${object.kind}, not a variable.`,
            ctx,
          );
        }
      }

      if (this.#currentDeclaration.hasSubstanceOnly !== undefined) {
        if (object.kind === "variable") {
          object.hasSubstanceOnly = this.#currentDeclaration.hasSubstanceOnly;
        } else {
          this.#reportError(
            `${object.name} is a ${object.kind}, not a variable.`,
            ctx,
          );
        }
      }
    }
  }

  enterModel(ctx: ModelContext): void {
    if (!this.#isActive) return;

    const name = ctx.NAME().text;
    const isExported = Boolean(ctx._star);
    // TODO: we need to stop adding any objects to this model, since the listener will continue anyways
    if (this.#document.models.has(name)) {
      this.#reportError(`Model '${name}' is already defined.`, ctx);
      return;
    }

    const model: AntimonyModel = {
      kind: "model",
      name,
      objects: new Map(),
      unnamedImports: [],
    };

    this.#document.models.set(name, model);
    this.#currentModel = model;

    if (isExported) {
      this.#document.exportedModel = name;
    }
  }

  exitModel(ctx: ModelContext): void {
    const exportListCtx = ctx.exportList();
    if (exportListCtx) {
      const model = this.#getActiveModel();
      const exports: AntimonyReference[] = [];
      let isValid = true;
      for (const variableCtx of exportListCtx.variable()) {
        const reference = getReferenceFromVariable(variableCtx);
        if (reference.length > 1) {
          this.#reportError("Cannot export subvariables.", variableCtx);
          isValid = false;
          continue;
        }

        const object = this.#getOrCreateObject(variableCtx, undefined);
        if (!object) {
          this.#reportError("Cannot export built-in.", variableCtx);
          isValid = false;
          continue;
        }

        if (!isRenameable(object)) {
          this.#reportError(
            `Cannot export ${variableCtx.text} because it is a ${object.kind}.`,
            variableCtx,
          );
          isValid = false;
          continue;
        }

        exports.push(reference);
      }

      if (isValid) {
        model.exports = exports;
      }
    }
    this.#currentModel = undefined;
  }

  enterDeclaration(ctx: DeclarationContext): void {
    if (!this.#isActive) return;

    const head = ctx.declarationHead();

    let isConst: boolean | undefined;
    let kind: VariableKind | undefined;
    let hasSubstanceOnly: boolean | undefined;

    const constModifier = head.CONST_MODIFIER();
    if (constModifier) {
      isConst = constModifier.text === "const";
    }

    const declWord = head.DECL_WORD();
    if (declWord) {
      if (!ALLOWED_DECLARATIONS.has(declWord.text as VariableKind)) {
        this.#reportError(`${declWord.text} is not supported.`, ctx);
        return;
      }
      kind = declWord.text as VariableKind;
    }

    if (head.SUBS_ONLY()) {
      hasSubstanceOnly = true;

      if (kind === undefined) {
        kind = "species";
      }

      if (kind !== "species") {
        this.#reportError("substanceOnly can only be used with species.", ctx);
        return;
      }
    }

    this.#currentDeclaration = { kind, isConst, hasSubstanceOnly };
  }

  exitDeclaration(_ctx: DeclarationContext): void {
    if (!this.#isActive) return;

    this.#currentDeclaration = undefined;
  }

  enterDeclarationName(ctx: DeclarationNameContext): void {
    if (!this.#isActive) return;
    if (!this.#currentDeclaration) return;

    // TODO: is it always OK to re-assign?
    const variable = this.#getOrCreateObject(
      ctx.variable(),
      ctx.inCompartment(),
    );

    if (!variable) {
      this.#reportError("Cannot use name of built-in within declaration", ctx);
      return;
    }

    this.#updateToDeclarationIfNecessary(ctx, variable);
  }

  /*
  TODO: fix plz
  Not every name is necessarily a variable, e.g. annotations for reaction.

  enterName(ctx: NameContext): void {
    this.#getOrCreateVariable(ctx);
  }
  
  enterSubvariable(ctx: SubvariableContext): void {
    this.#getOrCreateVariable(ctx);
  }
  
  enterConstant(ctx: ConstantContext): void {
    this.#getOrCreateVariable(ctx);
  }
  */

  enterVar(ctx: VarContext): void {
    if (!this.#isActive) return;

    this.#getOrCreateObject(ctx.variable(), undefined);
  }

  enterAssignment(ctx: AssignmentContext): void {
    if (!this.#isActive) return;

    // TODO: do this properly
    if (ctx.variable().text.endsWith(".sboTerm")) return;

    const object = this.#getOrCreateObject(ctx.variable(), ctx.inCompartment());
    if (!object) {
      this.#reportError("Cannot assign to built-in.", ctx);
      return;
    }

    this.#updateToDeclarationIfNecessary(ctx, object);

    const formula = ctx.formula();

    const mod = ctx._mod?.text;
    if (mod === ":") {
      if (object.kind !== "variable") {
        this.#reportError(
          `${object.name} is a ${object.kind} and cannot have assignment rule.`,
          ctx,
        );
        return;
      }

      if (object.assignment?.kind === "rate") {
        this.#reportError(
          "Variable defined by rate assignment cannot simultaneously be defined by rule assignment.",
          ctx,
        );
        return;
      }

      if (formula) {
        object.assignment = {
          kind: "rule",
          rule: this.#createFormula(formula),
        };
      } else {
        object.assignment = undefined;
      }
    } else if (mod === "'") {
      if (object.kind !== "variable") {
        this.#reportError(
          `${object.name} is a ${object.kind} and cannot have rate rule.`,
          ctx,
        );
        return;
      }

      if (object.assignment?.kind === "rule") {
        this.#reportError(
          "Variable defined by rule assignment cannot simultaneously be defined by rate assignment.",
          ctx,
        );
        return;
      }

      if (formula) {
        object.assignment = {
          kind: "rate",
          rate: this.#createFormula(formula),
          initial: object?.assignment?.initial,
        };
      } else {
        if (object.assignment?.kind === "rate") {
          if (object.assignment.initial) {
            object.assignment = {
              kind: "initial",
              initial: object.assignment.initial,
            };
          } else {
            object.assignment = undefined;
          }
        }
      }
    } else {
      if (object.kind === "variable") {
        if (object.assignment?.kind === "rule") {
          this.#reportError(
            "Cannot set initial value on variable defined by rule assignment.",
            ctx,
          );
          return;
        }

        if (formula) {
          if (!object.assignment) {
            object.assignment = {
              kind: "initial",
              initial: this.#createFormula(formula),
            };
          } else {
            object.assignment.initial = this.#createFormula(formula);
          }
        } else {
          if (object.assignment?.kind === "rate") {
            object.assignment.initial = undefined;
          } else {
            object.assignment = undefined;
          }
        }
      } else if (object.kind === "event") {
        if (formula) {
          object.trigger = this.#createFormula(formula);
        } else {
          object.trigger = undefined;
        }
      } else if (object.kind === "reaction") {
        if (formula) {
          object.rate = this.#createFormula(formula);
        } else {
          object.rate = undefined;
        }
      } else {
        this.#reportError(
          `${(object as AntimonyObject).name} of type ${(object as AntimonyObject).kind} cannot be assigned to.`,
          ctx,
        );
        return;
      }
    }
  }

  #getReactionTerms(ctx: ReactantListContext): AntimonyReactionTerm[] {
    const terms: AntimonyReactionTerm[] = [];
    for (const reactant of ctx.reactant()) {
      const object = this.#getOrCreateObject(reactant.variable(), undefined);

      if (!object) {
        this.#reportError("Cannot use built-in within reaction.", reactant);
        continue;
      }

      if (object.kind !== "variable") {
        this.#reportError(
          `${object.name} is of type ${object.kind} and cannot be used in a reaction.`,
          ctx,
        );
        continue;
      }

      // TODO: How does the original antimony handle this? We should do the same.
      if (object.variableKind === "compartment") {
        this.#reportError(
          `${object.name} is a compartment and cannot be used in a reaction.`,
          reactant,
        );
        continue;
      }

      this.#setVariableKind(reactant, object, "species");

      terms.push({
        reference: getReferenceFromVariable(reactant.variable()),
        stoichiometry: this.#createStoichiometry(reactant.stoichiometry()),
      });
    }
    return terms;
  }

  enterStoichiometry(ctx: StoichiometryContext): void {
    if (!this.#isActive) return;

    const variable = ctx.variable();
    if (variable) {
      const object = this.#getOrCreateObject(variable, undefined);
      if (object && object.kind !== "variable") {
        this.#reportError(
          `${object.name} of type ${object.kind} cannot be used as a stoichiometry.`,
          ctx,
        );
      }
    }
  }

  enterReaction(ctx: ReactionContext): void {
    if (!this.#isActive) return;

    const nameLabelCtx = ctx.nameLabel();
    let { reference, compartment } = this.#getOrDefaultReference(
      nameLabelCtx,
      "_J",
    );

    const activeModel = this.#getActiveModel();
    const [parentModel, name, _existing] = this.#resolveReferenceForAssignment(
      activeModel,
      reference,
      nameLabelCtx ?? ctx,
    ) as ModelObjectWithModelInfo;

    const compartmentCtx = ctx.inCompartment();
    if (compartmentCtx) {
      compartment = this.#getOrCreateCompartment(compartmentCtx);
    }

    let reactants: AntimonyReactionTerm[] = [];
    let products: AntimonyReactionTerm[] = [];

    if (ctx.reactionFormula()._left) {
      reactants = this.#getReactionTerms(ctx.reactionFormula()._left);

      if (compartment) {
        for (const term of reactants) {
          const reactant = resolveReference(
            activeModel,
            term.reference,
          ) as AntimonyVariable;
          reactant.compartment = compartment;
        }
      }
    }

    if (ctx.reactionFormula()._right) {
      products = this.#getReactionTerms(ctx.reactionFormula()._right);

      if (compartment) {
        for (const term of products) {
          const product = resolveReference(
            activeModel,
            term.reference,
          ) as AntimonyVariable;
          product.compartment = compartment;
        }
      }
    }

    // TODO: throw when two reactions have the same name

    this.#setObject(
      parentModel,
      name,
      {
        kind: "reaction",
        isDeleted: false,
        name,
        compartment,
        reactants,
        products,
        rate: this.#createFormula(ctx.formula()),
      },
      ctx,
    );
  }

  enterEvent(ctx: EventContext): void {
    if (!this.#isActive) return;

    // It's safe to ignore events with no assignments since they have no effect
    const assignmentsCtx = ctx.eventAssignments();
    if (!assignmentsCtx) return;

    const assignments = new Map<AntimonyReference, AntimonyFormula>();
    for (const assignment of assignmentsCtx.eventAssignment()) {
      const variable = this.#getOrCreateObject(
        assignment.variable(),
        undefined,
      );
      if (!variable) {
        this.#reportError("Cannot assign to built-in.", ctx);
        return;
      }
      if (variable.kind !== "variable") {
        this.#reportError(
          `Cannot assign to ${assignment.variable().text} in an event because it is a ${variable.kind}.`,
          assignment,
        );
        continue;
      }

      assignments.set(
        getReferenceFromVariable(assignment.variable()),
        this.#createFormula(assignment.formula()),
      );
    }

    const options: Record<string, AntimonyFormula> = {};
    const eventOptions = ctx.eventOptions();
    if (eventOptions) {
      for (const option of eventOptions.eventOption()) {
        const name = option.NAME().text;
        if (!builtinEventOptions.includes(name)) {
          this.#reportError(`Unknown event option: ${name}`, option);
          continue;
        }

        options[name] = this.#createFormula(option.formula());
      }
    }

    const nameLabelCtx = ctx.nameLabel();
    const { reference, compartment } = this.#getOrDefaultReference(
      nameLabelCtx,
      "_E",
    );
    const [parentModel, name] = this.#resolveReferenceForAssignment(
      this.#getActiveModel(),
      reference,
      nameLabelCtx ?? ctx,
    ) as ModelObjectWithModelInfo;

    this.#setObject(
      parentModel,
      name,
      {
        kind: "event",
        isDeleted: false,
        name,
        compartment,
        assignments,
        trigger: this.#createFormula(ctx._trigger),
        delay: this.#createFormula(ctx._delay),
        options: options,
      },
      ctx,
    );
  }

  enterInStatement(ctx: InStatementContext): void {
    if (!this.#isActive) return;

    const compartment = this.#getOrCreateCompartment(ctx.inCompartment());
    const object = this.#getOrCreateObject(ctx.variable(), ctx.inCompartment());

    if (!object) {
      this.#reportError("Cannot set compartment of built-in.", ctx);
      return;
    }

    object.compartment = compartment;
  }

  enterFunctionDefinition(ctx: FunctionDefinitionContext): void {
    if (!this.#isActive) return;

    const name = ctx.NAME().text;
    const parameterNames: string[] = [];
    for (const parameterName of ctx.parameterList().NAME()) {
      if (parameterNames.includes(parameterName.text)) {
        this.#reportError(
          `Parameter name '${parameterName.text}' is included multiple times.`,
          ctx.parameterList(),
        );
        return;
      }

      parameterNames.push(parameterName.text);
    }

    if (this.#document.functions.has(name)) {
      this.#reportError(`Function ${name} is defined twice.`, ctx);
      return;
    }

    this.#document.functions.set(name, {
      kind: "function",
      name: name,
      parameters: parameterNames,
      body: ctx.formula(),
    });
  }

  #rename(
    fromModel: AntimonyModel,
    fromName: string,
    fromObject: AntimonyModelObject,
    toModel: AntimonyModel,
    toName: string,
    toObject: AntimonyObject | undefined,
    ctx: ParserRuleContext,
  ): void {
    // do nothing when renaming to itself
    if (fromObject === toObject) {
      return;
    }

    // apply antimony sync/merge rules
    if (toObject) {
      if (fromObject.kind !== toObject.kind) {
        this.#reportError(
          `Cannot rename ${fromObject.name} which is a ${fromObject.kind} to ${toObject.name} which is a ${toObject.kind}.`,
          ctx,
        );
        return;
      } else if (
        fromObject.kind === "variable" &&
        toObject.kind === "variable"
      ) {
        if (
          ((toObject.variableKind === "compartment" &&
            fromObject.variableKind !== "parameter") ||
            (fromObject.variableKind === "compartment" &&
              toObject.variableKind !== "parameter")) &&
          !(
            fromObject.variableKind === "compartment" &&
            toObject.variableKind === "compartment"
          )
        ) {
          this.#reportError(
            `Cannot rename ${fromObject.name} which is a ${fromObject.variableKind} to ${toObject.name} because it is a ${toObject.variableKind}.`,
            ctx,
          );
          return;
        }

        if (toObject.assignment) {
          fromObject.assignment = toObject.assignment;
        }
        if (toObject.variableKind === "species") {
          fromObject.variableKind = "species";
        }
      }
    }

    fromObject.name = toName;
    toModel.objects.set(toName, fromObject);
    fromModel.objects.set(fromName, {
      kind: "renameLink",
      name: fromName,
      to: createReference(toModel, toName),
    });
  }

  enterRename(ctx: RenameContext): void {
    if (!this.#isActive) return;

    const fromCtx = ctx.variable(0);
    const toCtx = ctx.variable(1);

    const fromObject = this.#getOrCreateObject(fromCtx, undefined);
    const [fromModel, fromName, _fromObject] = this.#resolveVariable(
      this.#getActiveModel(),
      fromCtx,
    );
    if (!fromObject) {
      this.#reportError("Cannot rename a built-in", ctx);
      return;
    }
    if (!isRenameable(fromObject)) {
      this.#reportError(
        `Cannot rename ${fromObject.name} because it is a ${fromObject.kind}.`,
        ctx,
      );
      return;
    }

    const [toModel, toName, toObject] = this.#resolveVariable(
      this.#getActiveModel(),
      toCtx,
    );

    this.#rename(
      fromModel,
      fromName,
      fromObject,
      toModel,
      toName,
      toObject,
      ctx,
    );
  }

  enterModelImport(ctx: ModelImportContext): void {
    if (!this.#isActive) return;

    const name = ctx.NAME().text;
    const callingModel = this.#document.models.get(name);
    if (!callingModel) {
      this.#reportError(`No model with the name of '${name}'.`, ctx);
      return;
    }

    let parentModel: AntimonyObject;
    let importName: string | undefined;
    let existingObject: AntimonyObject | undefined;
    const nameLabelCtx = ctx.nameLabel();
    if (nameLabelCtx) {
      const importReference = getReferenceFromNameLabel(nameLabelCtx);
      [parentModel, importName, existingObject] =
        this.#resolveReferenceForAssignment(
          this.#getActiveModel(),
          importReference,
          nameLabelCtx,
        ) as ModelObjectWithModelInfo;
    } else {
      parentModel = this.#getActiveModel();
    }

    // NOTE: this DOES not match the original Antimony's behavior but is much more
    // sensible in my opinion. In the original, you can import into an existing model's name
    // which can make the model invalid as references are no longer valid.
    if (existingObject) {
      this.#reportError(
        `Cannot import to ${importName} as it is already a ${existingObject.kind}.`,
        ctx,
      );
      return;
    }

    if (callingModel === parentModel) {
      this.#reportError(`Cannot import '${name}' into itself.`, ctx);
      return;
    }

    let referenceHead = importName ?? parentModel.unnamedImports.length;
    const copiedModel = copyAntimonyObject(
      callingModel,
      referenceHead,
    ) as AntimonyModel;
    copiedModel.parent = parentModel;

    if (importName === undefined) {
      copiedModel.name = `${DEFAULT_IMPORT_PREFIX}${parentModel.unnamedImports.length}`;
      referenceHead = parentModel.unnamedImports.length;
      parentModel.unnamedImports.push(copiedModel);
    } else {
      copiedModel.name = importName;
      referenceHead = importName;
      parentModel.objects.set(importName, copiedModel);
    }

    const importListCtx = ctx.exportList();
    const importCtxs = importListCtx.variable();
    for (let i = 0; i < importCtxs.length; i++) {
      const exportReference = copiedModel.exports?.[i];
      if (!exportReference) {
        this.#reportError(
          `${copiedModel.name} only exports ${copiedModel.exports?.length ?? 0} variables but you tried to use ${importCtxs.length}.`,
          importCtxs[i],
        );
        break;
      }

      const importCtx = importCtxs[i];
      const [fromModel, fromName, fromObject] = resolveReferenceWithModelInfo(
        parentModel,
        [referenceHead, ...exportReference],
      );
      if (typeof fromName !== "string") {
        throw new Error("Export reference last item was not a string.");
      } else if (!isRenameable(fromObject)) {
        throw new Error("Export reference is not renameable.");
      }

      const [toModel, toName, toObject] = this.#resolveVariable(
        parentModel,
        importCtx,
      );
      this.#rename(
        fromModel,
        fromName,
        fromObject,
        toModel,
        toName,
        toObject,
        importCtx,
      );
    }
  }

  enterDelete(ctx: DeleteContext): void {
    if (!this.#isActive) return;

    const variableCtx = ctx.variable();
    const reference = getReferenceFromVariable(variableCtx);
    if (reference.length <= 1) {
      this.#reportError("Only objects inside submodels can be deleted.", ctx);
      return;
    }

    const got = this.#getOrCreateObject(variableCtx, undefined);
    if (!got) {
      this.#reportError("Cannot delete built-in.", ctx);
      return;
    }

    if ("isDeleted" in got) {
      got.isDeleted = true;
    } else {
      this.#reportError(
        `Cannot delete ${got.name} because it is a ${got.kind}.`,
        ctx,
      );
    }
  }

  #getContentFromString(stringCtx: StringContext): string {
    const normalString = stringCtx.STRING();
    if (normalString) {
      return normalString.text.slice(1, -1).replaceAll(/\\(.)/g, "$1");
    }

    const longString = stringCtx.LONG_STRING();
    if (longString) {
      return longString.text.slice(3, -3);
    }

    this.#reportError("Bad string.", stringCtx);
    return "";
  }

  enterVariableAnnotation(ctx: VariableAnnotationContext): void {
    if (!this.#isActive) return;

    const variableCtx = ctx.variable();
    const body = ctx.annotationBody();
    const item = body.annotationItem();
    const strings = body.string();

    if (item.text === "is") {
      if (strings.length > 1) {
        // TODO: this error sucks
        this.#reportError(
          "is annotation can only be used with one string.",
          ctx,
        );
        // we don't want to early return, just use the best name available
      }

      const object = this.#getOrCreateObject(variableCtx, undefined);
      if (!object) {
        return;
      }

      object.displayName = this.#getContentFromString(strings[0]);
    } // ignore everything else for now, maybe validate later
  }
}
