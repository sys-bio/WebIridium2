import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { AntimonyListener } from "../generated/AntimonyListener";
import {
  AssignmentContext,
  ConstantContext,
  ReactantListContext,
  ReactionContext,
  VariableContext,
} from "../generated/AntimonyParser";
import { AntimonyVariable, AntimonyModel, AntimonyReactionTerm } from "./model";
import { ErrorNode } from "antlr4ts/tree/ErrorNode";
import { getVariableName } from "./util";

/**
 * Derives an array of AntimonyModel.
 *
 * Every variable starts off "unknown". At the end of an evaluation, all "unknown"
 * variables are equivalently
 */
export class DeriveModelListener
  implements AntimonyListener, ParseTreeListener
{
  #baseModel: AntimonyModel;
  #models: Map<string, AntimonyModel>;
  #currentModel: AntimonyModel | undefined;

  constructor() {
    this.#models = new Map();
    this.#baseModel = {
      name: "__main",
      variables: new Map(),
      reactions: new Map(),
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
        kind: "unknown",
        name: name,
        isConst: variableCtx instanceof ConstantContext,
      };
      model.variables.set(variable.name, variable);
    }

    return variable;
  }

  enterAssignment(ctx: AssignmentContext): void {
    this.#getOrCreateVariable(ctx.variable()).assignment = {
      kind: "set",
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

    // TODO: what happens when two reactions have the same name
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

  visitErrorNode(_node: ErrorNode): void {
    // TODO: do something with this
    // right now it is just to satisfy the ParseTreeListener interface
  }
}
