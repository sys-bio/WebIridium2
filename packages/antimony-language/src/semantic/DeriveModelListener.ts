import { SemanticError } from "../errors";
import type { AntimonyListener } from "../generated/AntimonyListener";
import { ParserRuleContext } from "antlr4ts";
import {
  AnnotationContext,
  AssignmentContext,
  ConstantContext,
  DeclarationContext,
  DeclarationNameContext,
  EventContext,
  FormulaContext,
  InCompartmentContext,
  InStatementContext,
  NameContext,
  NameLabelContext,
  ReactantListContext,
  ReactionContext,
  StoichiometryContext,
  StringContext,
  SubvariableContext,
  VarContext,
  VariableContext,
} from "../generated/AntimonyParser";
import type {
  AntimonyVariable,
  AntimonyModel,
  AntimonyReactionTerm,
  VariableKind,
  AntimonyObject,
  AntimonyModelObject,
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

const getVariableName = (variableCtx: VariableContext): string[] => {
  if (variableCtx instanceof NameContext) {
    return [variableCtx.NAME().text];
  } else if (variableCtx instanceof SubvariableContext) {
    return [
      ...getVariableName(variableCtx.variable()),
      variableCtx.NAME().text,
    ];
  } else if (variableCtx instanceof ConstantContext) {
    return getVariableName(variableCtx.variable());
  } else {
    throw new Error(`unknown variable type: ${variableCtx.text}`);
  }
};

/**
 * Derives an array of AntimonyModel.
 */
export class DeriveModelListener implements AntimonyListener {
  #baseModel: AntimonyModel;
  #models: Map<string, AntimonyModel>;
  #currentModel: AntimonyModel | undefined;
  #currentDeclaration: DeclarationState | undefined;

  #diagnostics?: Error[];

  constructor({ diagnostics }: { diagnostics?: Error[] } = {}) {
    this.#models = new Map();
    this.#baseModel = {
      kind: "model",
      name: DEFAULT_MODEL_NAME,
      objects: new Map(),
    };
    this.#models.set(this.#baseModel.name, this.#baseModel);

    this.#diagnostics = diagnostics;
  }

  getModels(): AntimonyModel[] {
    return Array.from(this.#models.values());
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
  ): string | null {
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

      return compartmentObject.name;
    }
  }

  /**
   * Get or create a variable and return it.
   * If the variable has the name of a built-in, does not create
   * the varaible, instead returns undefined.
   */
  #getOrCreateObject(
    variableCtx: VariableContext,
    compartmentCtx: InCompartmentContext | undefined,
    defaultVariableKind?: VariableKind,
  ): AntimonyModelObject | undefined {
    const model = this.#getActiveModel();
    const fullName = getVariableName(variableCtx);

    if (fullName.length > 1) {
      // TODO: actually do this properly instead of making fake throwaway variable
      return {
        kind: "variable",
        variableKind: "parameter",
        compartment: this.#getOrCreateCompartment(compartmentCtx),
        isConst: false,
        hasSubstanceOnly: false,
        name: fullName.slice(1).join("."),
      };
    }

    const name = fullName[0];

    if (isBuiltinName(name)) {
      return undefined;
    }

    let object = model.objects.get(name);

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
  ): { name: string; compartment: string | null } {
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

  enterDeclaration(ctx: DeclarationContext): void {
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
    this.#currentDeclaration = undefined;
  }

  enterDeclarationName(ctx: DeclarationNameContext): void {
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
    this.#getOrCreateObject(ctx.variable(), undefined);
  }

  enterAssignment(ctx: AssignmentContext): void {
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
        name: object.name,
        stoichiometry: reactant.stoichiometry(),
      });
    }
    return terms;
  }

  enterStoichiometry(ctx: StoichiometryContext): void {
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
          const reactant = model.objects.get(term.name) as AntimonyVariable;
          reactant.compartment = compartment;
        }
      }
    }

    if (ctx.reactionFormula()._right) {
      products = this.#getReactionTerms(ctx.reactionFormula()._right);

      if (compartment) {
        for (const term of products) {
          const product = model.objects.get(term.name) as AntimonyVariable;
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
    // It's safe to ignore events with no assignments since they have no effect
    const assignmentsCtx = ctx.eventAssignments();
    if (!assignmentsCtx) return;

    const assignments: Record<string, FormulaContext> = {};
    for (const assignment of assignmentsCtx.eventAssignment()) {
      const variable = this.#getOrCreateObject(
        assignment.variable(),
        undefined,
      );
      if (!variable) {
        this.#reportError("Cannot assign to built-in.", ctx);
        return;
      }

      assignments[variable.name] = assignment.formula();
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
    const compartment = this.#getOrCreateCompartment(ctx.inCompartment());
    const object = this.#getOrCreateObject(ctx.variable(), ctx.inCompartment());

    if (!object) {
      this.#reportError("Cannot set compartment of built-in.", ctx);
      return;
    }

    object.compartment = compartment;
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

  enterAnnotation(_ctx: AnnotationContext): void {
    // TODO: re-implement annotations
    /**
    const variableAnnotatation = ctx.variableAnnotation();
    if (variableAnnotatation) {
      const variableCtx = variableAnnotatation.variable();
      const body = variableAnnotatation.annotationBody();
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

        const variable = this.#getActiveModel().variables.get(
          getVariableName(variableCtx)[0],
        );
        if (!variable) {
          // TODO: fix variable annotations and unify namespaces
          return;
        }

        variable.displayName = this.#getContentFromString(strings[0]);
      } // ignore everything else for now, maybe validate later
    }
    */
  }
}
