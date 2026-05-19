import type { AntimonyListener } from "../generated/AntimonyListener";
import {
  AssignmentContext,
  ConstantContext,
  EventContext,
  ReactantListContext,
  ReactionContext,
  VariableContext,
} from "../generated/AntimonyParser";
import type {
  AntimonyVariable,
  AntimonyModel,
  AntimonyReactionTerm,
  AntimonyEventAssignment,
} from "./model";
import { getVariableName } from "./util";

/**
 * Derives an array of AntimonyModel.
 */
export class DeriveModelListener implements AntimonyListener {
  #baseModel: AntimonyModel;
  #models: Map<string, AntimonyModel>;
  #currentModel: AntimonyModel | undefined;

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
    const name = getVariableName(variableCtx);
    let variable = model.variables.get(name);

    if (!variable) {
      variable = {
        kind: "parameter",
        name: name,
        isConst: variableCtx instanceof ConstantContext,
      };
      model.variables.set(variable.name, variable);
    }

    return variable;
  }

  enterAssignment(ctx: AssignmentContext): void {
    const kind =
      ctx.ASSIGNMENT().text === ":="
        ? "rule"
        : ctx._apostrophe
          ? "rate"
          : "set";

    this.#getOrCreateVariable(ctx.variable()).assignment = {
      kind: kind,
      formula: ctx.formula(),
    };
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
      variable.kind = "species";

      terms.push({
        name: variable.name,
        stoichiometry: Number(reactant.NUMBER()?.text ?? "1"),
      });
    }
    return terms;
  }

  enterEvent(ctx: EventContext): void {
    const assignments: AntimonyEventAssignment[] = [];
    for (const assignment of ctx.eventAssignment()) {
      const variable = this.#getOrCreateVariable(assignment.variable());
      assignments.push({ name: variable.name, formula: assignment.formula() });
    }

    this.#getActiveModel().events.push({
      assignments,
      trigger: ctx.formula(),
    });
  }
}
