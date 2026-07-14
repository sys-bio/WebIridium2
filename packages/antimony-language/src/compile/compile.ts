import type {
  IridiumModel,
  IridiumReaction,
  IridiumSpecies,
  IridiumParameter,
  IridiumExpression,
  IridiumParameterValue,
  IridiumEvent,
} from "iridium-simulator";
import type { AntimonyModel } from "../semantic/model";
import { compileFormula } from "./formula";
import type { Metadata } from "./metadata";
import { CompileError, CompileInvariantError } from "../errors";
import { NameContext, type FormulaContext } from "../grammar";

const INVALID_BOOLEAN_MESSAGE =
  "You can only use the values `true` or `false` here.";

/**
 * Evaluates a boolean formula.
 *
 * @throws if the formula is neither exactly `true` or `false`
 */
export const evaluateBoolean = (formula: FormulaContext): boolean => {
  if (formula.childCount !== 1) {
    throw new CompileError(INVALID_BOOLEAN_MESSAGE, { tree: formula });
  }

  const child = formula.getChild(0);
  if (!(child instanceof NameContext)) {
    throw new CompileError(INVALID_BOOLEAN_MESSAGE, { tree: formula });
  }

  if (child.text === "true") {
    return true;
  } else if (child.text === "false") {
    return false;
  } else {
    throw new CompileError(INVALID_BOOLEAN_MESSAGE, { tree: formula });
  }
};

export const compileToIridium = (
  models: AntimonyModel[],
): IridiumModel<Metadata> => {
  // TODO: handle multiple models
  const mainModel = models[0];

  const reactions: IridiumReaction<Metadata>[] = [];
  const reactionInvolvedVariables = new Set<string>();
  for (const [name, reaction] of mainModel.reactions) {
    let rate: IridiumExpression<Metadata>;

    if (reaction.rate) {
      rate = compileFormula(reaction.rate);
    } else {
      rate = { kind: "number", value: 0 };
    }

    for (const reactant of reaction.reactants) {
      reactionInvolvedVariables.add(reactant.name);
    }

    for (const product of reaction.products) {
      reactionInvolvedVariables.add(product.name);
    }

    reactions.push({
      name,
      reactants: reaction.reactants,
      products: reaction.products,
      rate,
    });
  }

  const species: IridiumSpecies<Metadata>[] = [];
  const parameters: IridiumParameter<Metadata>[] = [];

  for (const [name, variable] of mainModel.variables) {
    if (variable.kind === "species") {
      if (
        variable.assignment === undefined ||
        variable.assignment?.kind === "set"
      ) {
        species.push({
          name,
          initial: variable.assignment
            ? compileFormula(variable.assignment.initial)
            : { kind: "number", value: 0 },
        });
      } else {
        if (reactionInvolvedVariables.has(name)) {
          throw new CompileError(
            `Species cannot be simultaneously involved in a reaction and determined by a rate/assignment rule`,
            {
              tree:
                variable.assignment.kind === "rule"
                  ? variable.assignment.rule
                  : variable.assignment.rate,
            },
          );
        }

        let value: IridiumParameterValue<Metadata>;

        if (variable.assignment.kind === "rule") {
          value = {
            kind: "assignment",
            assignment: compileFormula(variable.assignment.rule),
          };
        } else if (variable.assignment.kind === "rate") {
          value = {
            kind: "rate",
            initial: variable.assignment.initial
              ? compileFormula(variable.assignment.initial)
              : { kind: "number", value: 0 },
            rate: compileFormula(variable.assignment.rate),
          };
        } else {
          throw new CompileInvariantError("Unknown variable assignment kind.");
        }

        parameters.push({ name, value });
      }
    } else if (variable.kind === "parameter") {
      let value: IridiumParameterValue<Metadata>;

      if (variable.assignment === undefined) {
        value = { kind: "initial", initial: { kind: "number", value: 0 } };
      } else if (variable.assignment.kind === "set") {
        value = {
          kind: "initial",
          initial: compileFormula(variable.assignment.initial),
        };
      } else if (variable.assignment.kind === "rule") {
        value = {
          kind: "assignment",
          assignment: compileFormula(variable.assignment.rule),
        };
      } else if (variable.assignment.kind === "rate") {
        value = {
          kind: "rate",
          initial: variable.assignment.initial
            ? compileFormula(variable.assignment.initial)
            : { kind: "number", value: 0 },
          rate: compileFormula(variable.assignment.rate),
        };
      } else {
        throw new CompileInvariantError("Unknown variable assignment kind.");
      }

      parameters.push({ name, value });
    }
  }

  const events: IridiumEvent<Metadata>[] = [];

  for (const [name, event] of mainModel.events) {
    events.push({
      name,
      trigger: compileFormula(event.trigger),
      assignments: Array.from(event.assignments.entries()).map(
        ([name, value]) => ({
          name,
          value: compileFormula(value),
        }),
      ),
      isPersistent: event.options.persistent
        ? evaluateBoolean(event.options.persistent)
        : true,
      isFromTrigger: event.options.fromTrigger
        ? evaluateBoolean(event.options.fromTrigger)
        : true,
      isT0: event.options.t0 ? evaluateBoolean(event.options.t0) : true,
    });
  }

  return { species, parameters, reactions, events };
};
