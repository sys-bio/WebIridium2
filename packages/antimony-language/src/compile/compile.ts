import {
  compile as compileIridium,
  type IridiumModel,
  type IridiumReaction,
  type IridiumVariable,
  type IridiumExpression,
  type IridiumVariableValue,
  type IridiumEvent,
  type IridiumReactionTerm,
  type RuntimeModel,
} from "iridium-simulator";
import type { AntimonyModel } from "../semantic/model";
import { compileFormula } from "./formula";
import type { Metadata } from "./metadata";
import { CompileError, CompileInvariantError } from "../errors";
import { NameContext, type FormulaContext } from "../grammar";
import { deriveModels } from "../semantic/semantic";

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
  for (const [name, reaction] of mainModel.objects) {
    if (reaction.kind !== "reaction") continue;

    let rate: IridiumExpression<Metadata>;

    if (reaction.rate) {
      rate = compileFormula(reaction.rate);
    } else {
      rate = { kind: "number", value: 0 };
    }

    const reactants: IridiumReactionTerm<Metadata>[] = [];
    for (const reactant of reaction.reactants) {
      // Ignore const since they won't be affected by the reaction.
      const variable = mainModel.objects.get(reactant.name);
      if (variable && variable.kind === "variable" && variable.isConst)
        continue;
      reactionInvolvedVariables.add(reactant.name);
      reactants.push(reactant);
    }

    const products: IridiumReactionTerm<Metadata>[] = [];
    for (const product of reaction.products) {
      // Ignore const since they won't be affected by the reaction.
      const variable = mainModel.objects.get(product.name);
      if (variable && variable.kind === "variable" && variable.isConst)
        continue;
      reactionInvolvedVariables.add(product.name);
      products.push(product);
    }

    reactions.push({
      name,
      reactants,
      products,
      rate,
    });
  }

  const variables: IridiumVariable<Metadata>[] = [];
  const compartments: Map<string, string[]> = new Map();

  for (const [name, variable] of mainModel.objects) {
    if (variable.kind !== "variable") continue;

    if (variable.variableKind === "species") {
      if (
        variable.assignment === undefined ||
        variable.assignment?.kind === "initial"
      ) {
        if (reactionInvolvedVariables.has(name)) {
          variables.push({
            name,
            hasSubstanceOnly: variable.hasSubstanceOnly,
            value: {
              kind: "reaction",
              initial: variable.assignment
                ? compileFormula(variable.assignment.initial)
                : { kind: "number", value: 0 },
            },
          });
        } else {
          variables.push({
            name,
            hasSubstanceOnly: variable.hasSubstanceOnly,
            value: {
              kind: "initial",
              initial: variable.assignment
                ? compileFormula(variable.assignment.initial)
                : { kind: "number", value: 0 },
            },
          });
        }
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

        let value: IridiumVariableValue<Metadata>;

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

        variables.push({
          name,
          value,
          hasSubstanceOnly: variable.hasSubstanceOnly,
        });
      }
    } else if (
      variable.variableKind === "parameter" ||
      variable.variableKind === "compartment"
    ) {
      let value: IridiumVariableValue<Metadata>;

      if (variable.assignment === undefined) {
        value = {
          kind: "initial",
          initial: {
            kind: "number",
            value: variable.variableKind === "compartment" ? 1 : 0,
          },
        };
      } else if (variable.assignment.kind === "initial") {
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

      variables.push({
        name,
        value,
        hasSubstanceOnly: variable.hasSubstanceOnly,
      });
    }

    if (variable.compartment) {
      if (!compartments.has(variable.compartment)) {
        compartments.set(variable.compartment, [variable.name]);
      } else {
        compartments.get(variable.compartment)!.push(variable.name);
      }
    }
  }

  const events: IridiumEvent<Metadata>[] = [];

  for (const [name, event] of mainModel.objects) {
    if (event.kind !== "event") continue;

    const iridiumEvent: IridiumEvent<Metadata> = {
      name,
      trigger: compileFormula(event.trigger),
      assignments: Array.from(Object.entries(event.assignments)).map(
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
    };

    if (event.delay) {
      iridiumEvent.delay = compileFormula(event.delay);
    }

    if (event.options.priority) {
      iridiumEvent.priority = compileFormula(event.options.priority);
    }

    events.push(iridiumEvent);
  }

  return {
    variables,
    reactions,
    events,
    compartments: Array.from(compartments.entries()).map(
      ([containerVariable, containedVariables]) => ({
        containerVariable,
        containedVariables,
      }),
    ),
  };
};

export const compile = async (source: string): Promise<RuntimeModel> => {
  const models = deriveModels(source);
  const ir = compileToIridium(models);
  return await compileIridium(ir);
};
