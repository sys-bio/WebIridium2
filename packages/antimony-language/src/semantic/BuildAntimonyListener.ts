import { SemanticError } from "../errors";
import type { AntimonyListener } from "../generated/AntimonyListener";
import { ParserRuleContext } from "antlr4ts";
import {
  AssignmentContext,
  ConstantContext,
  DeclarationContext,
  DeclarationNameContext,
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
  PARENT_SYMBOL,
  type AntimonyConcreteObject,
} from "./model";
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

const copyAntimonyObject = (
  object: AntimonyModelObject,
): AntimonyModelObject => {
  switch (object.kind) {
    case "model": {
      const copy: AntimonyModel = {
        ...object,
        objects: new Map(),
        unnamedImports: [],
      };
      copy;
      for (const [name, subobject] of object.objects) {
        const subobjectCopy = copyAntimonyObject(subobject);
        if (subobjectCopy.kind === "model") {
          subobjectCopy.parent = copy;
        }
        copy.objects.set(name, subobjectCopy);
      }
      for (const submodel of object.unnamedImports) {
        const submodelCopy = copyAntimonyObject(submodel) as AntimonyModel;
        submodelCopy.parent = copy;
        copy.unnamedImports.push(submodelCopy);
      }
      return copy;
    }
    case "variable": {
      const copy: AntimonyVariable = { ...object };
      if (object.assignment) {
        copy.assignment = { ...object.assignment };
      }
      return copy;
    }
    case "reaction":
    case "event":
    case "renameLink":
      return { ...object };
  }
};

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

/**
 * If the object is a renameLink, follow it. Otherwise, return the object.
 */
const resolveObject = (
  document: AntimonyDocument,
  model: AntimonyModel,
  object: AntimonyObject | undefined,
): AntimonyConcreteObject | undefined =>
  object?.kind === "renameLink"
    ? resolveReference(document, model, object.to)
    : object;

export const resolveReference = (
  document: AntimonyDocument,
  model: AntimonyModel,
  reference: AntimonyReference,
): AntimonyConcreteObject => {
  // special-case for functions
  if (
    typeof reference[0] === "string" &&
    document.functions.has(reference[0])
  ) {
    return document.functions.get(reference[0])!;
  }

  let current: AntimonyObject = model;

  for (let i = 0; i < reference.length; i++) {
    const name = reference[i];
    if (current.kind !== "model") {
      throw new Error(`Can only reference models: ${reference.join(".")}.`);
    }

    const got: AntimonyModelObject | undefined =
      name === PARENT_SYMBOL ? current.parent : current.objects.get(name);

    if (!got) {
      if (name === PARENT_SYMBOL) {
        throw new Error(
          `${current.name} has no parent in ${reference.join(".")}.`,
        );
      } else {
        throw new Error(`Missing ${name} in ${reference.join(".")}.`);
      }
    }

    current = resolveObject(document, current, got)!;
  }

  return current as AntimonyConcreteObject;
};

/**
 * Create reference from one object to another.
 * @param from - reference to where we want our new reference to start from
 * @param to - reference to where we want our new reference to point to
 */
const createReference = (
  from: AntimonyReference,
  to: AntimonyReference,
): AntimonyReference => {
  // then we want createReference(B.S.A, A.S.A)
  // then we want createReference(A.B.C.m, A.B.D.m)
  // which is PARENT,PARENT,A,S,A
  const reference = [];

  let sharedAncestorIndex = 0;
  for (let i = 0; i < from.length - 1; i++) {
    if (from[i] !== to[i]) {
      break;
    }
    sharedAncestorIndex += 1;
  }

  for (let i = 0; i < from.length - sharedAncestorIndex - 1; i++) {
    reference.push(PARENT_SYMBOL);
  }

  for (let i = sharedAncestorIndex; i < to.length; i++) {
    reference.push(to[i]);
  }

  return reference;
};

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

  #getActiveModel(): AntimonyModel {
    if (!this.#currentModel) {
      return this.#baseModel;
    }
    return this.#currentModel;
  }

  get #isActive(): boolean {
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

  #resolveVariable(
    model: AntimonyModel,
    variableCtx: VariableContext,
  ): [model: AntimonyModel, name: string, object: AntimonyObject | undefined] {
    if (variableCtx instanceof NameContext) {
      return [
        model,
        variableCtx.NAME().text,
        resolveObject(
          this.#document,
          model,
          model.objects.get(variableCtx.NAME().text),
        ),
      ];
    } else if (variableCtx instanceof SubvariableContext) {
      const [_model, _name, head] = this.#resolveVariable(
        model,
        variableCtx.variable(),
      );
      const name = variableCtx.NAME().text;
      if (!head) {
        return [model, name, undefined];
      }

      if (head.kind !== "model") {
        // TODO: fix this temporary havk to get this to work
        if (name !== "sboTerm") {
          this.#reportError(
            `Cannot access object of type ${head.kind}`,
            variableCtx,
          );
        }
        return [model, name, undefined];
      }

      const got = head.objects.get(variableCtx.NAME().text);
      if (!got) {
        this.#reportError(
          `'${variableCtx.NAME().text}' is not a subvariable of '${variableCtx.variable().text}'.`,
          variableCtx,
        );
        return [head, name, undefined];
      }

      return [head, name, resolveObject(this.#document, head, got)];
    } else if (variableCtx instanceof ConstantContext) {
      return this.#resolveVariable(model, variableCtx.variable());
    } else {
      throw new Error(`unknown variable type: ${variableCtx.text}`);
    }
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

  #getOrDefaultName(
    nameLabelCtx: NameLabelContext | undefined,
    prefix: string,
  ): { name: string; compartment: AntimonyReference | null } {
    if (nameLabelCtx) {
      return {
        name: nameLabelCtx.NAME().text,
        compartment: this.#getOrCreateCompartment(nameLabelCtx.inCompartment()),
      };
    } else {
      let candidate: string;
      let i = 0;
      do {
        candidate = `${prefix}${i++}`;
      } while (this.#getActiveModel().objects.has(candidate));

      return { name: candidate, compartment: null };
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
      parent: this.#getActiveModel(),
      objects: new Map(),
      unnamedImports: [],
    };

    this.#document.models.set(name, model);
    this.#currentModel = model;

    if (isExported) {
      this.#document.exportedModel = name;
    }
  }

  exitModel(): void {
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

    const object = this.#getOrCreateObject(ctx.variable(), ctx.inCompartment());
    if (!object) {
      this.#reportError("Cannot assign to built-in.", ctx);
      return;
    }

    this.#updateToDeclarationIfNecessary(ctx, object);

    const formula = ctx.formula();
    if (!formula) return;

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

      object.assignment = {
        kind: "rule",
        rule: formula,
      };
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

      object.assignment = {
        kind: "rate",
        rate: formula,
        initial: object?.assignment?.initial,
      };
    } else {
      if (object.kind === "variable") {
        if (object.assignment?.kind === "rule") {
          this.#reportError(
            "Cannot set initial value on variable defined by rule assignment.",
            ctx,
          );
          return;
        }

        if (!object.assignment) {
          object.assignment = {
            kind: "initial",
            initial: formula,
          };
        } else {
          object.assignment.initial = formula;
        }
      } else if (object.kind === "event") {
        object.trigger = formula;
      } else if (object.kind === "reaction") {
        object.rate = formula;
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
        stoichiometry: reactant.stoichiometry(),
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

    const model = this.#getActiveModel();

    const nameResult = this.#getOrDefaultName(ctx.nameLabel(), "_J");

    const name = nameResult.name;
    let compartment = nameResult.compartment;

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
            this.#document,
            model,
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
            this.#document,
            model,
            term.reference,
          ) as AntimonyVariable;
          product.compartment = compartment;
        }
      }
    }

    // TODO: throw when two reactions have the same name

    model.objects.set(name, {
      kind: "reaction",
      name,
      compartment,
      reactants,
      products,
      rate: ctx.formula(),
    });
  }

  enterEvent(ctx: EventContext): void {
    if (!this.#isActive) return;

    // It's safe to ignore events with no assignments since they have no effect
    const assignmentsCtx = ctx.eventAssignments();
    if (!assignmentsCtx) return;

    const assignments = new Map<AntimonyReference, FormulaContext>();
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
        assignment.formula(),
      );
    }

    const options: Record<string, FormulaContext> = {};
    const eventOptions = ctx.eventOptions();
    if (eventOptions) {
      for (const option of eventOptions.eventOption()) {
        const name = option.NAME().text;
        if (!builtinEventOptions.includes(name)) {
          this.#reportError(`Unknown event option: ${name}`, option);
          continue;
        }

        options[name] = option.formula();
      }
    }

    const { name, compartment } = this.#getOrDefaultName(ctx.nameLabel(), "_E");

    this.#getActiveModel().objects.set(name, {
      kind: "event",
      name,
      compartment,
      assignments,
      trigger: ctx._trigger,
      delay: ctx._delay,
      options: options,
    });
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

  enterModelImport(ctx: ModelImportContext): void {
    if (!this.#isActive) return;

    const name = ctx.NAME().text;
    const callingModel = this.#document.models.get(name);
    const currentModel = this.#getActiveModel();
    if (callingModel === currentModel) {
      this.#reportError(`Cannot import '${name}' into itself.`, ctx);
      return;
    }
    if (!callingModel) {
      this.#reportError(`No model with the name of '${name}'.`, ctx);
      return;
    }

    let importName: string | undefined;
    const nameLabelCtx = ctx.nameLabel();
    if (nameLabelCtx) {
      importName = nameLabelCtx.NAME().text;
    }

    const copiedModel = copyAntimonyObject(callingModel) as AntimonyModel;
    if (importName === undefined) {
      copiedModel.name = `${DEFAULT_IMPORT_PREFIX}${currentModel.unnamedImports.length}`;
      currentModel.unnamedImports.push(copiedModel);
    } else {
      const prevObject = currentModel.objects.get(importName);
      if (prevObject && prevObject.kind !== "model") {
        this.#reportError(
          `Cannot import to ${importName} as it is already a ${prevObject.kind}.`,
          ctx,
        );
        return;
      }

      copiedModel.name = importName;
      currentModel.objects.set(importName, copiedModel);
    }
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
    if (fromObject.kind === "function" || fromObject.kind === "model") {
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

    // do nothing when renaming to itself
    if (fromObject === toObject) {
      return;
    }

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
          (toObject.variableKind === "compartment" &&
            fromObject.variableKind !== "parameter") ||
          (fromObject.variableKind === "compartment" &&
            toObject.variableKind !== "parameter")
        ) {
          this.#reportError(
            `Cannot rename ${fromObject.name} which is a ${fromObject.variableKind} to ${toObject.name} because it is a ${toObject.variableKind}.`,
            ctx,
          );
          return;
        }

        // apply antimony sync rules
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
      to: createReference(
        getReferenceFromVariable(fromCtx),
        getReferenceFromVariable(toCtx),
      ),
    });
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
