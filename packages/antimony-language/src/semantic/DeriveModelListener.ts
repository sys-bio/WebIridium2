import { SemanticError } from "../errors";
import type { AntimonyListener } from "../generated/AntimonyListener";
import {
  AssignmentContext,
  ConstantContext,
  DeclarationContext,
  DeclarationNameContext,
  EventContext,
  FormulaContext,
  NameContext,
  ReactantListContext,
  ReactionContext,
  SubvariableContext,
  VariableContext,
} from "../generated/AntimonyParser";
import type {
  AntimonyVariable,
  AntimonyModel,
  AntimonyReactionTerm,
  VariableKind,
} from "./model";

type DeclarationState = {
  kind: VariableKind;
  isConst: boolean;
};

const ALLOWED_DECLARATIONS = new Set<VariableKind>([
  "species",
  "parameter",
  "compartment",
]);

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

  constructor() {
    this.#models = new Map();
    this.#baseModel = {
      name: "__main",
      variables: new Map(),
      reactions: new Map(),
      events: [],
    };
    this.#models.set(this.#baseModel.name, this.#baseModel);
  }

  getModels(): AntimonyModel[] {
    return Array.from(this.#models.values());
  }

  #getActiveModel(): AntimonyModel {
    if (!this.#currentModel) {
      return this.#baseModel;
    }
    return this.#currentModel;
  }

  #getOrCreateVariable(variableCtx: VariableContext): AntimonyVariable {
    const model = this.#getActiveModel();
    const fullName = getVariableName(variableCtx);

    if (fullName.length > 1) {
      // TODO: actually do this properly instead of making fake throwaway variable
      return {
        kind: "parameter",
        isConst: false,
        name: fullName.slice(1).join("."),
      };
    }

    const name = fullName[0];
    let variable = model.variables.get(name);

    if (!variable) {
      variable = {
        kind: this.#currentDeclaration?.kind ?? "parameter",
        name: name,
        isConst:
          variableCtx instanceof ConstantContext ||
          (this.#currentDeclaration?.isConst ?? false),
      };
      model.variables.set(variable.name, variable);
    }

    if (variableCtx instanceof ConstantContext) {
      variable.isConst = true;
    }

    return variable;
  }

  enterDeclaration(ctx: DeclarationContext): void {
    let isConst = false;
    let kind: VariableKind = "parameter";

    const constModifier = ctx.CONST_MODIFIER();
    if (constModifier) {
      isConst = constModifier.text === "const";
    }

    const declWord = ctx.DECL_WORD();
    if (declWord) {
      if (!ALLOWED_DECLARATIONS.has(declWord.text as VariableKind)) {
        throw new SemanticError(`${declWord.text} is not supported.`, {
          tree: ctx,
        });
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
    const variable = this.#getOrCreateVariable(ctx.variable());
    variable.kind = this.#currentDeclaration.kind;
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

  enterAssignment(ctx: AssignmentContext): void {
    const variable = this.#getOrCreateVariable(ctx.variable());
    const mod = ctx._mod?.text;
    if (mod === ":") {
      if (variable.assignment?.kind === "rate") {
        throw new SemanticError(
          "Variable defined by rate assignment cannot simultaneously be defined by rule assignment.",
          {
            tree: ctx,
          },
        );
      }

      variable.assignment = {
        kind: "rule",
        rule: ctx.formula(),
      };
    } else if (mod === "'") {
      if (variable.assignment?.kind === "rule") {
        throw new SemanticError(
          "Variable defined by rule assignment cannot simultaneously be defined by rate assignment.",
          {
            tree: ctx,
          },
        );
      }

      variable.assignment = {
        kind: "rate",
        rate: ctx.formula(),
        initial: variable?.assignment?.initial,
      };
    } else {
      if (variable.assignment?.kind === "rule") {
        throw new SemanticError(
          "Cannot set initial value on variable defined by rule assignment.",
          {
            tree: ctx,
          },
        );
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

  enterReaction(ctx: ReactionContext): void {
    const model = this.#getActiveModel();

    const name = this.#getOrDefaultReactionName(ctx);
    let reactants: AntimonyReactionTerm[] = [];
    let products: AntimonyReactionTerm[] = [];

    if (ctx.reactionFormula()._left) {
      reactants = this.#getReactionTerms(ctx.reactionFormula()._left);
    }

    if (ctx.reactionFormula()._right) {
      products = this.#getReactionTerms(ctx.reactionFormula()._right);
    }

    // TODO: throw when two reactions have the same name

    model.reactions.set(name, {
      name,
      reactants,
      products,
      rate: ctx.formula(),
    });
  }

  #getOrDefaultReactionName(ctx: ReactionContext): string {
    const reactionName = ctx.reactionName();
    if (reactionName) {
      return reactionName.NAME().text;
    } else {
      const model = this.#getActiveModel();
      let candidate: string;
      let i = 0;
      do {
        candidate = `_J${i++}`;
      } while (model.reactions.has(candidate));

      return candidate;
    }
  }

  #getReactionTerms(ctx: ReactantListContext): AntimonyReactionTerm[] {
    const terms: AntimonyReactionTerm[] = [];
    for (const reactant of ctx.reactant()) {
      const variable = this.#getOrCreateVariable(reactant.variable());
      // TODO: How does the original antimony handle this? We should do the same.
      if (variable.kind === "compartment") {
        throw new SemanticError("Cannot use compartment in reaction.", {
          tree: reactant,
        });
      }

      variable.kind = "species";

      terms.push({
        name: variable.name,
        stoichiometry: Number(reactant.NUMBER()?.text ?? "1"),
      });
    }
    return terms;
  }

  enterEvent(ctx: EventContext): void {
    const assignments = new Map<string, FormulaContext>();
    for (const assignment of ctx.eventAssignment()) {
      const variable = this.#getOrCreateVariable(assignment.variable());
      assignments.set(variable.name, assignment.formula());
    }

    this.#getActiveModel().events.push({
      assignments,
      trigger: ctx.formula(),
    });
  }
}
