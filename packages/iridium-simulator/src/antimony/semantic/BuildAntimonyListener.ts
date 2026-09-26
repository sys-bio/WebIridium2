import { SemanticError } from "../errors";
import type { AntimonyListener } from "../generated/AntimonyListener";
import { ParserRuleContext } from "antlr4ts";
import {
  AlgebraicRuleContext,
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
  ModelAssignmentContext,
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
  type AntimonyFormula,
  type AntimonyStoichiometry,
} from "./document";
import { isBuiltinName } from "../../runtime/builtins";
import { BadReferenceError, resolveReference } from "./reference";

type DeclarationState = {
  kind?: VariableKind;
  isConst?: boolean;
  hasSubstanceOnly?: boolean;
};

type ModelTemplateNameHandle = {
  kind: "modelTemplate";
  name: string;
  model: AntimonyModel;
};
type FunctionNameHandle = { kind: "function"; name: string };
type BuiltinNameHandle = { kind: "builtin"; name: string };
type ObjectNameHandle = {
  kind: "object";
  model: AntimonyModel;
  object?: AntimonyModelObject;
  name: string;
  /** The original object before jumping any rename links. */
  original?: ObjectNameHandle;
};
type RequiredObjectNameHandle = Required<Omit<ObjectNameHandle, "original">> &
  Pick<ObjectNameHandle, "original">;
type AssignmentNameHandle = {
  kind: "attribute";
  source: RequiredObjectNameHandle | ModelTemplateNameHandle;
  name: string;
};

type NameHandle =
  | ModelTemplateNameHandle
  | FunctionNameHandle
  | BuiltinNameHandle
  | ObjectNameHandle
  | AssignmentNameHandle;
type RequiredNameHandle =
  | Exclude<NameHandle, { kind: "object" }>
  | RequiredObjectNameHandle;

const ALLOWED_DECLARATIONS = new Set<VariableKind>(["species", "compartment"]);

export const DEFAULT_COMPARTMENT_NAME = "default_compartment";
export const DEFAULT_MODEL_NAME = "__main";
export const DEFAULT_IMPORT_PREFIX = "_sys";

export const builtinEventOptions = [
  "t0",
  "priority",
  "fromTrigger",
  "persistent",
];

const prependReferenceForFormula = (
  formula: { scope: AntimonyReference | null; target?: AntimonyReference },
  prefix: string | number,
): void => {
  if (formula.scope) {
    formula.scope = [prefix, ...formula.scope];
  } else {
    formula.scope = [prefix];
  }

  if (formula.target) {
    formula.target = [prefix, ...formula.target];
  }
};

const prependReferenceForCompartment = (
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

      if (
        copy.timeConversionFactor &&
        typeof copy.timeConversionFactor !== "number"
      ) {
        copy.timeConversionFactor = [
          referencePrefix,
          ...copy.timeConversionFactor,
        ];
      }

      if (
        copy.extentConversionFactor &&
        typeof copy.extentConversionFactor !== "number"
      ) {
        copy.extentConversionFactor = [
          referencePrefix,
          ...copy.extentConversionFactor,
        ];
      }

      if (copy.conversionFactor && typeof copy.conversionFactor !== "number") {
        copy.conversionFactor = [referencePrefix, ...copy.conversionFactor];
      }

      return copy;
    }
    case "variable": {
      const copy = { ...object };

      prependReferenceForCompartment(copy, referencePrefix);

      if (object.assignment) {
        copy.assignment = { ...object.assignment };

        if (copy.assignment.kind === "initial") {
          copy.assignment.initial = { ...copy.assignment.initial };
          prependReferenceForFormula(copy.assignment.initial, referencePrefix);
        } else if (copy.assignment.kind === "rule") {
          copy.assignment.rule = { ...copy.assignment.rule };
          prependReferenceForFormula(copy.assignment.rule, referencePrefix);
        } else if (copy.assignment.kind === "rate") {
          if (copy.assignment.initial) {
            copy.assignment.initial = { ...copy.assignment.initial };
            prependReferenceForFormula(
              copy.assignment.initial,
              referencePrefix,
            );
          }
          copy.assignment.rate = { ...copy.assignment.rate };
          prependReferenceForFormula(copy.assignment.rate, referencePrefix);
        }
      }

      return copy;
    }
    case "reaction": {
      const copy = { ...object };

      prependReferenceForCompartment(copy, referencePrefix);

      if (copy.rate) {
        copy.rate = { ...copy.rate };
        prependReferenceForFormula(copy.rate, referencePrefix);
      }

      const newReactants = [];
      for (const reactant of copy.reactants) {
        const newReactant = { ...reactant };
        if (newReactant.stoichiometry) {
          newReactant.stoichiometry = { ...newReactant.stoichiometry };
          prependReferenceForFormula(
            newReactant.stoichiometry,
            referencePrefix,
          );
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
          prependReferenceForFormula(newProduct.stoichiometry, referencePrefix);
        }
        newProduct.reference = [referencePrefix, ...newProduct.reference];
        newProducts.push(newProduct);
      }
      copy.products = newProducts;

      return copy;
    }
    case "algebraicRule": {
      const copy = { ...object };
      if (copy.formula) {
        copy.formula = { ...copy.formula };
        prependReferenceForFormula(copy.formula, referencePrefix);
      }
      return copy;
    }
    case "event": {
      const copy = { ...object };

      prependReferenceForCompartment(copy, referencePrefix);

      if (copy.trigger) {
        copy.trigger = { ...copy.trigger };
        prependReferenceForFormula(copy.trigger, referencePrefix);
      }

      if (copy.delay) {
        copy.delay = { ...copy.delay };
        prependReferenceForFormula(copy.delay, referencePrefix);
      }

      const newAssignments = new Map<AntimonyReference, AntimonyFormula>();
      for (const [reference, assignment] of copy.assignments) {
        const assignmentCopy = { ...assignment };
        prependReferenceForFormula(assignmentCopy, referencePrefix);
        newAssignments.set([referencePrefix, ...reference], assignmentCopy);
      }
      copy.assignments = newAssignments;

      const newOptions = { ...copy.options };
      for (const [name, option] of Object.entries(copy.options)) {
        if (option) {
          const optionCopy = { ...option };
          prependReferenceForFormula(optionCopy, referencePrefix);
          newOptions[name] = optionCopy;
        }
      }
      copy.options = newOptions;

      return copy;
    }
    case "renameLink": {
      const copy = { ...object, to: [referencePrefix, ...object.to] };
      if (copy.conversionFactor) {
        copy.conversionFactor = [referencePrefix, ...copy.conversionFactor];
      }
      return copy;
    }
  }
};

const getReferenceFromHandle = ({
  model,
  name,
}: ObjectNameHandle): AntimonyReference => {
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

  reference.push(name);

  return reference;
};

const resolveReferenceAsHandle = (
  root: AntimonyModel,
  reference: AntimonyReference,
): RequiredObjectNameHandle => {
  let parent: AntimonyModel = root;
  let current: AntimonyModelObject | undefined;

  for (let i = 0; i < reference.length; i++) {
    const name = reference[i];

    if (typeof name === "string") {
      current = parent.objects.get(name);
    } else {
      current = parent.unnamedImports[name];
    }

    if (i < reference.length - 1) {
      if (!current || current.kind !== "model") {
        throw new BadReferenceError("Incomplete reference.");
      }
      parent = current;
    }
  }

  if (!current) {
    throw new BadReferenceError("Incomplete reference.");
  }

  return {
    kind: "object",
    model: parent,
    name: reference[reference.length - 1] as string,
    object: current,
  };
};

const resolveObjectAsHandle = (
  rootModel: AntimonyModel,
  handle: RequiredObjectNameHandle,
): RequiredObjectNameHandle => {
  if (handle.object.kind === "renameLink") {
    const newHandle = resolveReferenceAsHandle(rootModel, handle.object.to);
    newHandle.original = handle;
    return newHandle;
  } else {
    return handle;
  }
};

const isRenameable = (
  object: AntimonyObject,
): object is Extract<
  AntimonyModelObject,
  { kind: "variable" | "reaction" | "event" | "algebraicRule" }
> =>
  object.kind === "variable" ||
  object.kind === "reaction" ||
  object.kind === "event" ||
  object.kind === "algebraicRule";

/**
 * Builds Antimony models from a parse tree.
 */
export class BuildAntimonyListener implements AntimonyListener {
  #baseModel: AntimonyModel;
  #document: AntimonyDocument;
  #currentModel: AntimonyModel | undefined;
  #currentDeclaration: DeclarationState | undefined;

  #isInsideFunction = false;

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
    return !this.#isInsideFunction;
  }

  #getActiveModel(): AntimonyModel {
    if (!this.#currentModel) {
      return this.#baseModel;
    }
    return this.#currentModel;
  }

  #createFormula(
    formula: FormulaContext,
    target?: AntimonyReference,
  ): AntimonyFormula;
  #createFormula(
    formula: FormulaContext | undefined,
    target?: AntimonyReference,
  ): AntimonyFormula | undefined;
  #createFormula(
    formula: FormulaContext | undefined,
    target?: AntimonyReference,
  ): AntimonyFormula | undefined {
    if (formula === undefined) return undefined;
    return { scope: null, ctx: formula, target };
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
    return { scope: null, ctx: stoichiometry };
  }

  /** returns true on success. */
  #setHandle(
    { model, name, object: existing }: ObjectNameHandle,
    object: AntimonyModelObject,
    ctx: ParserRuleContext,
  ): boolean {
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
      return;
    }

    if (variable.variableKind === "compartment" && kind !== "compartment") {
      this.#reportError(
        `Cannot convert ${variable.name} from compartment.`,
        ctx,
      );
      return;
    }

    if (
      kind === "stoichiometry" &&
      variable.variableKind !== "parameter" &&
      variable.variableKind !== "stoichiometry"
    ) {
      this.#reportError(
        `Cannot use ${variable.name} as a stoichiometry because it is a ${variable.variableKind}.`,
        ctx,
      );
      return;
    }

    variable.variableKind = kind;
  }

  #getOrCreateCompartment(
    compartmentCtx: InCompartmentContext | undefined,
  ): AntimonyReference | null {
    if (!compartmentCtx) {
      return null;
    } else {
      const handle = this.#ensureModelObject(
        compartmentCtx.variable(),
        undefined,
        "compartment",
      );

      if (!handle) {
        return null;
      } else if (handle.kind !== "object") {
        this.#reportError(
          `Cannot use ${handle.name} as a compartment because it is already a ${handle.kind}.`,
          compartmentCtx,
        );
        return null;
      }

      if (handle.object.kind !== "variable") {
        this.#reportError(
          `${handle.object.name} cannot be used as a compartment because it is a ${handle.object.kind}.`,
          compartmentCtx,
        );
        return null;
      }

      this.#setVariableKind(compartmentCtx, handle.object, "compartment");

      return getReferenceFromHandle(handle);
    }
  }

  #resolveNamePath(
    path: string[],
    {
      getDefaultObject,
      isCurrentModelTemplate: isModelAttribute,
    }: {
      getDefaultObject?: (name: string) => AntimonyModelObject;
      isCurrentModelTemplate?: boolean;
    } = {},
    ctx: ParserRuleContext,
  ): NameHandle | undefined {
    const activeModel = this.#getActiveModel();
    let current: NameHandle | undefined;

    if (isModelAttribute) {
      current = {
        kind: "modelTemplate",
        name: activeModel.name,
        model: activeModel,
      };
    }

    for (let i = 0; i < path.length; i++) {
      const name = path[i];
      if (!current) {
        if (isBuiltinName(name)) {
          current = { kind: "builtin", name };
        } else if (this.#document.functions.has(name)) {
          current = { kind: "function", name };
        } else if (this.#document.models.has(name)) {
          current = {
            kind: "modelTemplate",
            name,
            model: this.#document.models.get(name)!,
          };
        } else {
          const object = activeModel.objects.get(name);
          if (object) {
            current = resolveObjectAsHandle(activeModel, {
              kind: "object",
              model: activeModel,
              name,
              object,
            });
          } else if (!object && getDefaultObject) {
            const defaulted = getDefaultObject(name);
            activeModel.objects.set(name, defaulted);
            current = {
              kind: "object",
              model: activeModel,
              name,
              // this is the default object
              object: defaulted,
            };
          } else {
            current = { kind: "object", model: activeModel, name };
          }
        }
      } else {
        switch (current.kind) {
          case "function":
            this.#reportError(
              `${current.name} does not have any subvariables because it is a function.`,
              ctx,
            );
            return;
          case "builtin":
            this.#reportError(
              `${current.name} does not have any subvariables because it is a built-in.`,
              ctx,
            );
            return;
          case "modelTemplate":
            if (name === "conversionFactor") {
              current = {
                kind: "attribute",
                source: current,
                name,
              };
              break;
            } else {
              this.#reportError(
                `${name} is not an attribute of ${current.name}.`,
                ctx,
              );
              return;
            }
          case "object":
            if (!current.object) {
              this.#reportError(
                `${current.name} does not have any subvariables because it has not been instantiated.`,
                ctx,
              );
              return;
            } else {
              switch (current.object.kind) {
                case "model": {
                  const got = current.object.objects.get(name);
                  if (got) {
                    current = resolveObjectAsHandle(activeModel, {
                      kind: "object",
                      model: current.object,
                      object: got,
                      name: got.name,
                    });
                  } else {
                    this.#reportError(
                      `${name} is not a subvariable of ${current.object.name}.`,
                      ctx,
                    );
                    return;
                  }
                  break;
                }
                case "variable":
                  if (name === "sboTerm") {
                    current = {
                      kind: "attribute",
                      source: current as RequiredObjectNameHandle,
                      name: "sboTerm",
                    };
                  } else if (name === "conversionFactor") {
                    current = {
                      kind: "attribute",
                      source: current as RequiredObjectNameHandle,
                      name: "conversionFactor",
                    };
                  } else {
                    this.#reportError(
                      `${name} is not a subvariable of ${current.object.name}.`,
                      ctx,
                    );
                    return;
                  }
                  break;
                case "reaction":
                  if (name === "kineticLaw") {
                    // NOTE: the original antimony will try to coerce the object to a reaction if it can, but we don't
                    current = {
                      kind: "attribute",
                      source: current as RequiredObjectNameHandle,
                      name: "kineticLaw",
                    };
                  } else {
                    this.#reportError(
                      `${name} is not a subvariable of ${current.object.name}.`,
                      ctx,
                    );
                    return;
                  }
                  break;
                case "event":
                case "algebraicRule":
                case "renameLink":
                  this.#reportError(
                    `${current.name} does not have any subvariables because it is a ${current.kind}.`,
                    ctx,
                  );
                  break;
              }
            }
            break;
          case "attribute":
            if (current.name === "kineticLaw") {
              if (name === "sboTerm") {
                current = {
                  kind: "attribute",
                  source: current.source,
                  name: "kineticLawSboTerm",
                };
              } else {
                this.#reportError(
                  `${name} is not a subvariable of ${current.name}.`,
                  ctx,
                );
              }
            } else {
              this.#reportError(
                `${current.name} does not have any subvariables.`,
                ctx,
              );
            }
            break;
        }
      }
    }

    return current;
  }

  /**
   * @returns - a NameHandle or undefined if an error occurred.
   */
  #resolveName(
    ctx: VariableContext | NameLabelContext,
    options: { getDefaultObject?: (name: string) => AntimonyModelObject } = {},
  ): NameHandle | undefined {
    let path: string[] = [];
    if (ctx instanceof VariableContext) {
      let current: VariableContext = ctx;
      while (current) {
        if (current instanceof NameContext) {
          path = [current.NAME().text];
          break;
        } else if (current instanceof SubvariableContext) {
          path = current.NAME().map((t) => t.text);
          break;
        } else if (current instanceof ConstantContext) {
          current = current.variable();
        }
      }
    } else if (ctx instanceof NameLabelContext) {
      path = ctx.NAME().map((t) => t.text);
    }

    return this.#resolveNamePath(path, options, ctx);
  }

  /**
   * @returns - a NameHandle for the name or undefined if an error occurred
   */
  #ensureModelObject(
    variableCtx: VariableContext,
    compartmentCtx: InCompartmentContext | undefined,
    defaultVariableKind?: VariableKind,
    allowHandleKind?: NameHandle["kind"],
  ): RequiredNameHandle | undefined {
    const compartment = this.#getOrCreateCompartment(compartmentCtx);
    const handle = this.#resolveName(variableCtx, {
      getDefaultObject: (name) => ({
        kind: "variable",
        variableKind:
          defaultVariableKind ?? this.#currentDeclaration?.kind ?? "parameter",
        compartment,
        name: name,
        isDeleted: false,
        isConst:
          variableCtx instanceof ConstantContext ||
          (this.#currentDeclaration?.isConst ?? false),
        hasSubstanceOnly: false,
      }),
    });

    if (!handle) return;

    if (handle.kind !== "object") {
      if (handle.kind === allowHandleKind) {
        return handle;
      }

      this.#reportError(
        `${handle.name} should be a model object, not a ${handle.kind}.`,
        variableCtx,
      );
      return;
    } else if (!handle.object) {
      return;
    }

    if (compartment) {
      handle.object.compartment = compartment;
    }

    if (
      handle.object.kind === "variable" &&
      variableCtx instanceof ConstantContext
    ) {
      handle.object.isConst = true;
    }

    return handle as RequiredNameHandle;
  }

  #getNameOrDefault(
    nameLabelCtx: NameLabelContext | undefined,
    prefix: string,
  ): NameHandle | undefined {
    if (nameLabelCtx) {
      return this.#resolveName(nameLabelCtx);
    } else {
      let candidate: string;
      let i = 0;
      do {
        candidate = `${prefix}${i++}`;
      } while (this.#getActiveModel().objects.has(candidate));

      return { kind: "object", model: this.#getActiveModel(), name: candidate };
    }
  }

  #tryUpdateToDeclaration(
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

      // we are in diagnostics mode, so re-open
      if (this.#diagnostics) {
        this.#currentModel = this.#document.models.get(name)!;
      }

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
        const handle = this.#ensureModelObject(variableCtx, undefined);
        if (!handle) {
          isValid = false;
          continue;
        } else if (handle.kind !== "object") {
          this.#reportError(
            `Cannot export ${handle.name} because it is a ${handle.kind}.`,
            variableCtx,
          );
          isValid = false;
          continue;
        }

        if (handle.model !== model) {
          this.#reportError("Cannot export subvariables.", variableCtx);
          isValid = false;
          continue;
        }

        if (!isRenameable(handle.object)) {
          this.#reportError(
            `Cannot export ${variableCtx.text} because it is a ${handle.object.kind}.`,
            variableCtx,
          );
          isValid = false;
          continue;
        }

        exports.push(getReferenceFromHandle(handle));
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
    const handle = this.#ensureModelObject(ctx.variable(), ctx.inCompartment());

    if (!handle) {
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `${handle.name} is not a valid declaration item because it is a ${handle.kind}.`,
        ctx,
      );
      return;
    }

    this.#tryUpdateToDeclaration(ctx, handle.object);
  }

  enterVar(ctx: VarContext): void {
    if (!this.#isActive) return;

    this.#ensureModelObject(ctx.variable(), undefined, undefined, "builtin");
  }

  #setAttributeAssignment(
    handle: AssignmentNameHandle,
    formula?: FormulaContext,
  ): void {
    const object =
      handle.source.kind === "object"
        ? handle.source.object
        : handle.source.model;

    switch (handle.name) {
      case "conversionFactor":
        if (object.kind === "model" || object.kind === "variable") {
          if (formula) {
            if (!(formula instanceof VarContext)) {
              this.#reportError(
                "Conversion factor must be a variable.",
                formula,
              );
              return;
            }

            const handle = this.#ensureModelObject(
              formula.variable(),
              undefined,
            );
            if (!handle) {
              return;
            } else if (handle.kind !== "object") {
              this.#reportError(
                `Cannot use ${handle.name} as a conversion factor because it is already a ${handle.kind}.`,
                formula,
              );
              return;
            } else if (handle.object.kind !== "variable") {
              this.#reportError(
                `Cannot use ${handle.name} as a conversion factor because it is already a ${handle.object.kind}.`,
                formula,
              );
              return;
            }

            if (object.kind === "variable") {
              this.#setVariableKind(formula, object, "species");
            }

            object.conversionFactor = getReferenceFromHandle(handle);
          } else {
            object.conversionFactor = undefined;
          }
        }
        break;
      case "kineticLaw":
        if (object.kind === "reaction") {
          const target =
            handle.source.kind === "object"
              ? getReferenceFromHandle(handle.source.original ?? handle.source)
              : undefined;
          if (formula) {
            object.rate = this.#createFormula(formula, target);
          } else {
            object.rate = undefined;
          }
        }
        break;
      default:
        break;
    }
  }

  enterAssignment(ctx: AssignmentContext): void {
    if (!this.#isActive) return;

    const formula = ctx.formula();

    const handle = this.#ensureModelObject(
      ctx.variable(),
      ctx.inCompartment(),
      undefined,
      "attribute",
    );
    if (!handle) {
      return;
    } else if (handle.kind === "attribute") {
      this.#setAttributeAssignment(handle, formula);
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `Cannot assign to ${handle.name} because it is a ${handle.kind}.`,
        ctx,
      );
      return;
    }

    const object = handle.object;
    const target = getReferenceFromHandle(handle.original ?? handle);
    this.#tryUpdateToDeclaration(ctx, object);

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
          rule: this.#createFormula(formula, target),
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
          rate: this.#createFormula(formula, target),
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
              initial: this.#createFormula(formula, target),
            };
          } else {
            object.assignment.initial = this.#createFormula(formula, target);
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
          object.rate = this.#createFormula(formula, target);
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

  enterModelAssignment(ctx: ModelAssignmentContext): void {
    const handle = this.#resolveNamePath(
      ctx.NAME().map((n) => n.text),
      { isCurrentModelTemplate: true },
      ctx,
    );
    if (!handle) {
      return;
    } else if (handle.kind !== "attribute") {
      this.#reportError("Expecting attribute.", ctx);
      return;
    }

    this.#setAttributeAssignment(handle, ctx.formula());
  }

  #getReactionTerms(ctx: ReactantListContext): AntimonyReactionTerm[] {
    const terms: AntimonyReactionTerm[] = [];
    for (const reactant of ctx.reactant()) {
      const handle = this.#ensureModelObject(reactant.variable(), undefined);

      if (!handle) {
        continue;
      } else if (handle.kind !== "object") {
        this.#reportError(
          `Cannot use ${handle.name} within a reaction because it is a ${handle.kind}.`,
          reactant,
        );
        continue;
      }

      const object = handle.object;
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
        reference: getReferenceFromHandle(handle),
        stoichiometry: this.#createStoichiometry(reactant.stoichiometry()),
      });
    }
    return terms;
  }

  enterStoichiometry(ctx: StoichiometryContext): void {
    if (!this.#isActive) return;

    const variable = ctx.variable();
    if (variable) {
      const handle = this.#ensureModelObject(variable, undefined);
      if (!handle) {
        return;
      } else if (handle.kind !== "object") {
        this.#reportError(
          `Cannot use ${handle.name} in stoichiometry because it is a ${handle.kind}.`,
          ctx,
        );
        return;
      } else if (handle.object.kind !== "variable") {
        this.#reportError(
          `Cannot use ${handle.object.name} in stoichiometry because it is a ${handle.object.kind}.`,
          ctx,
        );
        return;
      }

      // it has already been used as a stoichiometry
      if (handle.object.variableKind === "stoichiometry") {
        this.#reportError(
          `${handle.object.name} is already in the stoichiometry of another term. Use another name.`,
          ctx,
        );
        return;
      }

      this.#setVariableKind(ctx, handle.object, "stoichiometry");
    }
  }

  enterReaction(ctx: ReactionContext): void {
    if (!this.#isActive) return;

    const nameLabelCtx = ctx.nameLabel();
    const handle = this.#getNameOrDefault(ctx.nameLabel(), "_J");
    if (!handle) {
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `Cannot set ${handle.name} to a reaction because it is a ${handle.kind}.`,
        ctx,
      );
      return;
    }

    const compartment = this.#getOrCreateCompartment(
      nameLabelCtx?.inCompartment() ?? ctx.inCompartment(),
    );

    let reactants: AntimonyReactionTerm[] = [];
    let products: AntimonyReactionTerm[] = [];

    if (ctx.reactionFormula()._left) {
      reactants = this.#getReactionTerms(ctx.reactionFormula()._left);

      if (compartment) {
        for (const term of reactants) {
          const [reactant, _] = resolveReference(
            this.#getActiveModel(),
            term.reference,
          );
          (reactant as AntimonyVariable).compartment = compartment;
        }
      }
    }

    if (ctx.reactionFormula()._right) {
      products = this.#getReactionTerms(ctx.reactionFormula()._right);

      if (compartment) {
        for (const term of products) {
          const [product, _] = resolveReference(
            this.#getActiveModel(),
            term.reference,
          );
          (product as AntimonyVariable).compartment = compartment;
        }
      }
    }

    this.#setHandle(
      handle,
      {
        kind: "reaction",
        isDeleted: false,
        name: handle.name,
        compartment,
        reactants,
        products,
        rate: this.#createFormula(
          ctx.formula(),
          getReferenceFromHandle(handle),
        ),
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
      const handle = this.#ensureModelObject(assignment.variable(), undefined);
      if (!handle) {
        continue;
      } else if (handle.kind !== "object") {
        this.#reportError(
          `Cannot assign to ${handle.name} because it is ${handle.kind}.`,
          ctx,
        );
        continue;
      } else if (handle.object.kind !== "variable") {
        this.#reportError(
          `Cannot assign to ${handle.object.name} in an event because it is a ${handle.object.kind}.`,
          assignment,
        );
        continue;
      }

      const formula = assignment.formula();
      if (!formula) continue;

      assignments.set(
        getReferenceFromHandle(handle),
        this.#createFormula(formula),
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

    const handle = this.#getNameOrDefault(ctx.nameLabel(), "_E");
    if (!handle) {
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `Cannot set ${handle.name} to an event because it is ${handle.kind}.`,
        ctx,
      );
      return;
    }

    this.#setHandle(
      handle,
      {
        kind: "event",
        isDeleted: false,
        name: handle.name,
        compartment: this.#getOrCreateCompartment(
          ctx.nameLabel()?.inCompartment(),
        ),
        assignments,
        trigger: this.#createFormula(ctx._trigger),
        delay: this.#createFormula(ctx._delay),
        options: options,
      },
      ctx,
    );
  }

  enterAlgebraicRule(ctx: AlgebraicRuleContext): void {
    if (!this.#isActive) return;

    const handle = this.#getNameOrDefault(ctx.nameLabel(), "_alg");
    if (!handle) {
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `Cannot set ${handle.name} to an algebraic rule because it is a ${handle.kind}.`,
        ctx,
      );
      return;
    }

    this.#setHandle(
      handle,
      {
        kind: "algebraicRule",
        name: handle.name,
        isDeleted: false,
        constant: Number(ctx.NUMBER().text),
        formula: this.#createFormula(ctx.formula()),
      },
      ctx,
    );
  }

  enterInStatement(ctx: InStatementContext): void {
    if (!this.#isActive) return;

    const compartment = this.#getOrCreateCompartment(ctx.inCompartment());
    const handle = this.#ensureModelObject(ctx.variable(), ctx.inCompartment());

    if (!handle) {
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `Cannot set compartment of ${handle.name} because it is a ${handle.kind}.`,
        ctx,
      );
      return;
    }

    handle.object.compartment = compartment;
  }

  enterFunctionDefinition(ctx: FunctionDefinitionContext): void {
    if (!this.#isActive) return;
    this.#isInsideFunction = true;

    const handle = this.#resolveNamePath([ctx.NAME().text], undefined, ctx);
    if (!handle) {
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `Function cannot be named ${handle.name} because it is already a ${handle.kind}.`,
        ctx,
      );
      return;
    } else if (handle.object) {
      this.#reportError(
        `Function cannot be named ${handle.name} because it is already a ${handle.object.kind}.`,
        ctx,
      );
      return;
    }

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

    if (this.#document.functions.has(handle.name)) {
      this.#reportError(`Function ${handle.name} is defined twice.`, ctx);
      return;
    }

    this.#document.functions.set(handle.name, {
      kind: "function",
      name: handle.name,
      parameters: parameterNames,
      body: ctx.formula(),
    });
  }

  exitFunctionDefinition(): void {
    this.#isInsideFunction = false;
  }

  #rename(
    fromHandle: RequiredObjectNameHandle,
    toHandle: ObjectNameHandle,
    ctx: ParserRuleContext,
    conversionFactor?: AntimonyReference,
  ): void {
    // do nothing when renaming to itself
    if (toHandle.kind === "object" && fromHandle.object === toHandle.object) {
      if (conversionFactor) {
        this.#reportError(
          `Cannot rename ${fromHandle.name} to itself with a conversion factor.`,
          ctx,
        );
      }
      return;
    }

    const fromObject = fromHandle.object;

    // apply antimony sync/merge rules
    if (toHandle.kind === "object" && toHandle.object) {
      const toObject = toHandle.object;

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

    fromObject.name = toHandle.name;

    const model =
      toHandle.kind === "object" ? toHandle.model : this.#getActiveModel();
    model.objects.set(toHandle.name, fromObject);
    fromHandle.model.objects.set(fromHandle.name, {
      kind: "renameLink",
      name: fromHandle.name,
      to: getReferenceFromHandle(toHandle),
      conversionFactor,
    });
  }

  enterRename(ctx: RenameContext): void {
    if (!this.#isActive) return;

    const fromCtx = ctx.variable(0);
    const toCtx = ctx.variable(1);

    const fromHandle = this.#ensureModelObject(fromCtx, undefined);
    if (!fromHandle) {
      return;
    } else if (fromHandle.kind !== "object") {
      this.#reportError(
        `Cannot rename ${fromHandle.name} because it is a ${fromHandle.kind}.`,
        ctx,
      );
      return;
    }

    if (!isRenameable(fromHandle.object)) {
      this.#reportError(
        `Cannot rename ${fromHandle.name} because it is a ${fromHandle.object.kind}.`,
        ctx,
      );
      return;
    }

    const toHandle = this.#resolveName(toCtx);
    if (!toHandle) {
      return;
    } else if (toHandle.kind !== "object") {
      this.#reportError(
        `Cannot rename to ${toHandle.name} because it is a ${toHandle.kind}.`,
        ctx,
      );
      return;
    }

    let conversionFactor: AntimonyReference | undefined;

    const conversionFactorCtx =
      ctx.conversionFactorLeft() ?? ctx.conversionFactorRight();
    if (conversionFactorCtx) {
      const handle = this.#ensureModelObject(
        conversionFactorCtx.variable(),
        undefined,
      );
      if (handle) {
        if (handle.kind !== "object") {
          this.#reportError(
            `Cannot use ${handle.name} as a conversion factor because it is a ${handle.name}.`,
            ctx,
          );
        } else {
          conversionFactor = getReferenceFromHandle(handle);
        }
      }
    }

    this.#rename(fromHandle, toHandle, ctx, conversionFactor);
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

    const nameLabelCtx = ctx.nameLabel();
    if (nameLabelCtx) {
      const importHandle = this.#resolveName(nameLabelCtx);
      if (!importHandle) {
        return;
      } else if (importHandle.kind !== "object") {
        this.#reportError(
          `Cannot import model to ${importHandle.name} because it is already a ${importHandle.kind}.`,
          ctx,
        );
        return;
      } else if (importHandle.object) {
        // NOTE: this DOES not match the original Antimony's behavior but is much more
        // sensible in my opinion. In the original, you can import into an existing model's name
        // which can make the model invalid as references are no longer valid.
        this.#reportError(
          `Cannot import to ${importHandle.name} as it is already a ${importHandle.object.kind}.`,
          ctx,
        );
        return;
      }
      parentModel = importHandle.model;
      importName = importHandle.name;
    } else {
      parentModel = this.#getActiveModel();
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

    for (const optionCtx of ctx.modelImportOption()) {
      const optionName = optionCtx.NAME().text;
      const optionValueCtx = optionCtx.modelImportValue();
      let optionValue: number | AntimonyReference;
      if (optionValueCtx.NUMBER()) {
        optionValue = Number(optionValueCtx.NUMBER()!.text);
      } else {
        const variableCtx = optionValueCtx.variable();
        if (!variableCtx) continue;
        const handle = this.#ensureModelObject(variableCtx, undefined);
        if (!handle) {
          continue;
        } else if (handle.kind !== "object") {
          this.#reportError(
            `Cannot use ${handle.name} as an option because it is a ${handle.kind}.`,
            optionCtx,
          );
          continue;
        }
        optionValue = getReferenceFromHandle(handle);
      }

      if (optionName === "timeconv") {
        copiedModel.timeConversionFactor = optionValue;
      } else if (optionName === "extentconv") {
        copiedModel.extentConversionFactor = optionValue;
      } else {
        this.#reportError(
          `Unknown model import option: ${optionName}. The options are 'timeconv' and 'extentconv'.`,
          optionCtx,
        );
        continue;
      }
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
      const fromHandle = resolveReferenceAsHandle(parentModel, [
        referenceHead,
        ...exportReference,
      ]);
      if (!fromHandle || fromHandle.kind !== "object" || !fromHandle.object) {
        throw new Error("Export was not a model object.");
      } else if (!isRenameable(fromHandle.object)) {
        throw new Error("Export was not renameable.");
      }

      const toHandle = this.#resolveName(importCtx);
      if (!toHandle) {
        continue;
      } else if (toHandle.kind !== "object") {
        this.#reportError(
          `Cannot import to ${toHandle.name} because it is already a ${toHandle.kind}.`,
          importCtx,
        );
        continue;
      }
      this.#rename(
        {
          ...fromHandle,
          // need to do this so it typechecks :(
          object: fromHandle.object,
        },
        toHandle,
        importCtx,
      );
    }
  }

  enterDelete(ctx: DeleteContext): void {
    if (!this.#isActive) return;

    const variableCtx = ctx.variable();

    const handle = this.#ensureModelObject(variableCtx, undefined);
    if (!handle) {
      return;
    } else if (handle.kind !== "object") {
      this.#reportError(
        `Cannot delete ${handle.kind} because it is a ${handle.kind}.`,
        ctx,
      );
      return;
    }

    if (handle.model === this.#getActiveModel()) {
      this.#reportError("Only objects inside submodels can be deleted.", ctx);
    }

    if ("isDeleted" in handle.object) {
      handle.object.isDeleted = true;
    } else {
      this.#reportError(
        `Cannot delete ${handle.name} because it is a ${handle.object.kind}.`,
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

      const handle = this.#resolveName(variableCtx);
      if (!handle || handle.kind !== "object" || !handle.object) {
        return;
      }

      handle.object.displayName = this.#getContentFromString(strings[0]);
    } // ignore everything else for now, maybe validate later
  }
}
