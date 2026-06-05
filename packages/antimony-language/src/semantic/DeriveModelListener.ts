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
  InCompartmentContext,
  InStatementContext,
  NameContext,
  NameLabelContext,
  ReactantListContext,
  ReactionContext,
  SubvariableContext,
  VarContext,
  VariableContext,
} from "../generated/AntimonyParser";
import type {
  AntimonyVariable,
  AntimonyModel,
  AntimonyReactionTerm,
  VariableKind,
} from "./model";
import { isBuiltinName, builtinEventOptions } from "./builtins";

type DeclarationState = {
  kind?: VariableKind;
  isConst: boolean;
};

const ALLOWED_DECLARATIONS = new Set<VariableKind>([
  "species",
  "parameter",
  "compartment",
]);

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
      name: DEFAULT_MODEL_NAME,
      variables: new Map(),
      reactions: new Map(),
      events: new Map(),
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
    if (variable.kind === "species" && kind === "compartment") {
      this.#reportError(
        `Cannot convert ${variable.name} to compartment when it is a species.`,
        ctx,
      );
    }

    if (variable.kind === "compartment" && kind !== "compartment") {
      this.#reportError(
        `Cannot convert ${variable.name} from compartment.`,
        ctx,
      );
    }

    variable.kind = kind;
  }

  #getOrCreateCompartment(
    compartmentCtx: InCompartmentContext | undefined,
  ): string | null {
    if (!compartmentCtx) {
      return null;
    } else {
      const compartmentVariable = this.#getOrCreateVariable(
        compartmentCtx.variable(),
        undefined,
        "compartment",
      );

      if (!compartmentVariable) {
        this.#reportError(
          "Cannot use built-in as a compartment",
          compartmentCtx,
        );
        return null;
      }

      this.#setVariableKind(compartmentCtx, compartmentVariable, "compartment");

      return compartmentVariable.name;
    }
  }

  /**
   * Get or create a variable and return it.
   * If the variable has the name of a built-in, does not create
   * the varaible, instead returns undefined.
   */
  #getOrCreateVariable(
    variableCtx: VariableContext,
    compartmentCtx: InCompartmentContext | undefined,
    defaultKind?: VariableKind,
  ): AntimonyVariable | undefined {
    const model = this.#getActiveModel();
    const fullName = getVariableName(variableCtx);

    if (fullName.length > 1) {
      // TODO: actually do this properly instead of making fake throwaway variable
      return {
        kind: "parameter",
        compartment: this.#getOrCreateCompartment(compartmentCtx),
        isConst: false,
        name: fullName.slice(1).join("."),
      };
    }

    const name = fullName[0];

    if (isBuiltinName(name)) {
      return undefined;
    }

    let variable = model.variables.get(name);

    if (!variable) {
      variable = {
        kind: defaultKind ?? this.#currentDeclaration?.kind ?? "parameter",
        compartment: this.#getOrCreateCompartment(compartmentCtx),
        name: name,
        isConst:
          variableCtx instanceof ConstantContext ||
          (this.#currentDeclaration?.isConst ?? false),
      };
      model.variables.set(variable.name, variable);
    } else if (compartmentCtx) {
      variable.compartment = this.#getOrCreateCompartment(compartmentCtx);
    }

    if (variableCtx instanceof ConstantContext) {
      variable.isConst = true;
    }

    return variable;
  }

  #getOrDefaultName(
    nameLabelCtx: NameLabelContext | undefined,
    map: Map<string, unknown>,
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
      } while (map.has(candidate));

      return { name: candidate, compartment: null };
    }
  }

  enterDeclaration(ctx: DeclarationContext): void {
    let isConst = false;
    let kind: VariableKind | undefined;

    const constModifier = ctx.CONST_MODIFIER();
    if (constModifier) {
      isConst = constModifier.text === "const";
    }

    const declWord = ctx.DECL_WORD();
    if (declWord) {
      if (!ALLOWED_DECLARATIONS.has(declWord.text as VariableKind)) {
        this.#reportError(`${declWord.text} is not supported.`, ctx);
        return;
      }
      kind = declWord.text as VariableKind;
    }

    this.#currentDeclaration = { kind, isConst };
  }

  exitDeclaration(_ctx: DeclarationContext): void {
    this.#currentDeclaration = undefined;
  }

  enterDeclarationName(ctx: DeclarationNameContext): void {
    if (!this.#currentDeclaration) return;

    // TODO: is it always OK to re-assign?
    const variable = this.#getOrCreateVariable(
      ctx.variable(),
      ctx.inCompartment(),
    );
    if (!variable) {
      this.#reportError("Cannot use name of built-in within declaration", ctx);
      return;
    }

    if (this.#currentDeclaration.kind) {
      this.#setVariableKind(ctx, variable, this.#currentDeclaration.kind);
    }
    variable.isConst = this.#currentDeclaration.isConst;
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
    this.#getOrCreateVariable(ctx.variable(), undefined);
  }

  enterAssignment(ctx: AssignmentContext): void {
    const variable = this.#getOrCreateVariable(
      ctx.variable(),
      ctx.inCompartment(),
    );
    if (!variable) {
      this.#reportError("Cannot assign to built-in.", ctx);
      return;
    }

    if (this.#currentDeclaration) {
      if (this.#currentDeclaration.kind) {
        this.#setVariableKind(ctx, variable, this.#currentDeclaration.kind);
      }
      variable.isConst = this.#currentDeclaration.isConst;
    }

    const mod = ctx._mod?.text;
    if (mod === ":") {
      if (variable.assignment?.kind === "rate") {
        this.#reportError(
          "Variable defined by rate assignment cannot simultaneously be defined by rule assignment.",
          ctx,
        );
        return;
      }

      variable.assignment = {
        kind: "rule",
        rule: ctx.formula(),
      };
    } else if (mod === "'") {
      if (variable.assignment?.kind === "rule") {
        this.#reportError(
          "Variable defined by rule assignment cannot simultaneously be defined by rate assignment.",
          ctx,
        );
        return;
      }

      variable.assignment = {
        kind: "rate",
        rate: ctx.formula(),
        initial: variable?.assignment?.initial,
      };
    } else {
      if (variable.assignment?.kind === "rule") {
        this.#reportError(
          "Cannot set initial value on variable defined by rule assignment.",
          ctx,
        );
        return;
      }

      if (!variable.assignment) {
        variable.assignment = {
          kind: "set",
          initial: ctx.formula(),
        };
      } else {
        variable.assignment.initial = ctx.formula();
      }
    }
  }

  #getReactionTerms(ctx: ReactantListContext): AntimonyReactionTerm[] {
    const terms: AntimonyReactionTerm[] = [];
    for (const reactant of ctx.reactant()) {
      const variable = this.#getOrCreateVariable(
        reactant.variable(),
        undefined,
      );
      if (!variable) {
        this.#reportError("Cannot use built-in within reaction.", reactant);
        continue;
      }

      // TODO: How does the original antimony handle this? We should do the same.
      if (variable.kind === "compartment") {
        this.#reportError("Cannot use compartment in reaction.", reactant);
        continue;
      }

      this.#setVariableKind(reactant, variable, "species");

      terms.push({
        name: variable.name,
        stoichiometry: Number(reactant.NUMBER()?.text ?? "1"),
      });
    }
    return terms;
  }

  enterReaction(ctx: ReactionContext): void {
    const model = this.#getActiveModel();

    const nameResult = this.#getOrDefaultName(
      ctx.nameLabel(),
      this.#getActiveModel().reactions,
      "_J",
    );

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
          const reactant = model.variables.get(term.name)!;
          reactant.compartment = compartment;
        }
      }
    }

    if (ctx.reactionFormula()._right) {
      products = this.#getReactionTerms(ctx.reactionFormula()._right);

      if (compartment) {
        for (const term of products) {
          const product = model.variables.get(term.name)!;
          product.compartment = compartment;
        }
      }
    }

    // TODO: throw when two reactions have the same name

    model.reactions.set(name, {
      name,
      compartment,
      reactants,
      products,
      rate: ctx.formula(),
    });
  }

  enterEvent(ctx: EventContext): void {
    const assignments = new Map<string, FormulaContext>();
    for (const assignment of ctx.eventAssignments().eventAssignment()) {
      const variable = this.#getOrCreateVariable(
        assignment.variable(),
        undefined,
      );
      if (!variable) {
        this.#reportError("Cannot assign to built-in.", ctx);
        return;
      }

      assignments.set(variable.name, assignment.formula());
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

    const { name, compartment } = this.#getOrDefaultName(
      ctx.nameLabel(),
      this.#getActiveModel().events,
      "_E",
    );

    this.#getActiveModel().events.set(name, {
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
    const variable = this.#getOrCreateVariable(
      ctx.variable(),
      ctx.inCompartment(),
    );
    if (!variable) {
      this.#reportError("Cannot set compartment of built-in.", ctx);
      return;
    }

    variable.compartment = compartment;
  }
}
