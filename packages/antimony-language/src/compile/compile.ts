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
  type IridiumFunction,
} from "iridium-simulator";
import type {
  AntimonyDocument,
  AntimonyEvent,
  AntimonyModel,
  AntimonyObject,
  AntimonyReaction,
  AntimonyVariable,
} from "../semantic/model";
import {
  compileFormula,
  compileFormula as compileFormulaOriginal,
  compileStoichiometry as compileStoichiometryOriginal,
} from "./formula";
import type { Metadata } from "./metadata";
import { CompileError, CompileInvariantError } from "../errors";
import {
  NameContext,
  StoichiometryContext,
  VariableContext,
  type FormulaContext,
} from "../grammar";
import { buildAntimonyDocument } from "../semantic/semantic";
import {
  getReferenceFromVariable,
  resolveReference,
} from "../semantic/BuildAntimonyListener";
import { isBuiltinName } from "../semantic/builtins";

const INVALID_BOOLEAN_MESSAGE =
  "You can only use the values `true` or `false` here.";

/**
 * Evaluates a boolean formula.
 *
 * @throws CompileError - when the formula is neither exactly `true` or `false`
 */
const evaluateBoolean = (formula: FormulaContext): boolean => {
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

type IridiumNameable =
  | IridiumVariable
  | IridiumReaction
  | IridiumEvent
  | IridiumFunction;

/**
 * Helper for building the IridiumModel. Manages name collisions and keeps track of
 * names. Has a "prefix stack" which allows you to prepend a prefix to each added object.
 *
 * NOTICE: make sure to add all functions before anything else. This prevents name collisions with them.
 * Name collisions with functions will result an error, but it should not happen if they are added first.
 */
class IrBuilder {
  #ir: IridiumModel<Metadata>;
  #names: Set<string>;
  #sources: Map<AntimonyObject, string>;
  #prefixes: string[];

  constructor() {
    this.#ir = {
      variables: [],
      compartments: [],
      reactions: [],
      events: [],
      functions: [],
    };
    this.#names = new Set();
    this.#sources = new Map();
    this.#prefixes = [];
  }

  #getAvailableName(name: string): string {
    if (this.#prefixes) {
      name = this.#prefixes.join("") + name;
    }

    let newName = name;
    let counter = 0;
    while (this.#names.has(newName)) {
      newName = name + "_" + counter++;
    }

    return newName;
  }

  #setName(
    object: Omit<IridiumNameable, "name">,
    name: string,
  ): asserts object is IridiumNameable {
    // eslint-disable-next-line
    (object as any).name = name;
  }

  build(): IridiumModel<Metadata> {
    return this.#ir;
  }

  /**
   * Push a prefix to the prefix stack. Every added object
   * will have the prefixes in he prefix stack prepended to its name.
   */
  pushPrefix(prefix: string): void {
    this.#prefixes.push(prefix);
  }

  /**
   * Pop a prefix from the prefix stack.
   */
  popPrefix(): void {
    this.#prefixes.pop();
  }

  addSource(source: AntimonyObject): void {
    const name = this.#getAvailableName(source.name);
    this.#sources.set(source, name);
    this.#names.add(name);
  }

  addVariable(
    source: AntimonyObject,
    variable: Omit<IridiumVariable<Metadata>, "name">,
  ): void {
    this.#setName(variable, this.getNameOf(source));
    this.#ir.variables.push(variable);
  }

  addReaction(
    source: AntimonyObject,
    reaction: Omit<IridiumReaction<Metadata>, "name">,
  ): void {
    this.#setName(reaction, this.getNameOf(source));
    this.#ir.reactions.push(reaction);
  }

  addEvent(
    source: AntimonyObject,
    event: Omit<IridiumEvent<Metadata>, "name">,
  ): void {
    this.#setName(event, this.getNameOf(source));
    this.#ir.events.push(event);
  }

  addCompartment(container: AntimonyObject, contained: AntimonyObject[]): void {
    this.#ir.compartments.push({
      containerVariable: this.getNameOf(container),
      containedVariables: contained.map((variable) => this.getNameOf(variable)),
    });
  }

  addFunction(source: AntimonyObject, func: IridiumFunction<Metadata>): void {
    if (this.#names.has(func.name)) {
      throw new CompileInvariantError(
        `Name collision with function name '${func.name}'.`,
      );
    }

    this.#ir.functions.push(func);
    this.#names.add(func.name);
    this.#sources.set(source, func.name);
  }

  getNameOf(source: AntimonyObject): string {
    const got = this.#sources.get(source);
    if (!got) {
      throw new CompileInvariantError(`Object ${source.name} missing name.`);
    }
    return got;
  }
}

const addAllSources = (root: AntimonyModel, builder: IrBuilder): void => {
  const modelStack = [root];
  const seen = new Set<AntimonyModel>();
  while (modelStack.length > 0) {
    const got = modelStack.pop()!;

    if (seen.has(got)) {
      builder.popPrefix();
      continue;
    }

    seen.add(got);

    if (got !== root) {
      builder.pushPrefix(got.name + "__");
      modelStack.push(got);
    }

    for (const object of got.objects.values()) {
      if ("isDeleted" in object && object.isDeleted) continue;

      switch (object.kind) {
        case "variable":
          builder.addSource(object);
          break;
        case "reaction":
          builder.addSource(object);
          break;
        case "event":
          builder.addSource(object);
          break;
        case "model":
          modelStack.push(object);
          break;
        case "renameLink":
          break;
        default:
          throw new CompileInvariantError(
            `Unknown object kind: ${(object as AntimonyObject).kind}.`,
          );
      }
    }

    for (const submodel of got.unnamedImports) {
      modelStack.push(submodel);
    }
  }
};

const GOT_DELETED_SYMBOL = Symbol("GOT_DELETED");
const SPECIES_DEFAULT: IridiumExpression<Metadata> = {
  kind: "number",
  value: 0,
};
const COMPARTMENT_DEFAULT: IridiumExpression<Metadata> = {
  kind: "number",
  value: 1,
};

const compileModel = (
  model: AntimonyModel,
  builder: IrBuilder,
  document: AntimonyDocument,
): void => {
  const variables: AntimonyVariable[] = [];
  const reactions: AntimonyReaction[] = [];
  const events: AntimonyEvent[] = [];

  for (const object of model.objects.values()) {
    if ("isDeleted" in object && object.isDeleted) continue;

    switch (object.kind) {
      case "variable":
        variables.push(object);
        break;
      case "reaction":
        reactions.push(object);
        break;
      case "event":
        events.push(object);
        break;
      case "model":
        compileModel(object, builder, document);
        break;
      case "renameLink":
        break;
      default:
        throw new CompileInvariantError(
          `Unknown object kind: ${(object as AntimonyObject).kind}.`,
        );
    }
  }

  for (const submodel of model.unnamedImports) {
    compileModel(submodel, builder, document);
  }

  const resolveVariable = (variable: VariableContext): string => {
    const reference = getReferenceFromVariable(variable);
    if (reference.length > 1) {
      throw new CompileError(
        "You cannot refer to subvariables within a math expression.",
        { tree: variable },
      );
    }

    if (typeof reference[0] === "string") {
      if (isBuiltinName(reference[0])) {
        return reference[0];
      } else if (document.functions.has(reference[0])) {
        throw new CompileError(
          `${reference[0]} is a function and cannot be used as a variable.`,
          { tree: variable },
        );
      }
    }

    const object = resolveReference(model, reference);

    if (object.kind !== "variable" && object.kind !== "reaction") {
      throw new CompileError(
        `${object.name} is a ${object.kind} and cannot be used in a math expression.`,
        { tree: variable },
      );
    }

    if (object.isDeleted) {
      throw GOT_DELETED_SYMBOL;
    }

    return builder.getNameOf(object);
  };

  /**
   * Returns a FormulaContext compiled to an IridiumExpression. Returns undefined if the formula
   * should be deleted (can happen if it contains a deleted variable).
   */
  const compileFormulaInModel = (
    formula: FormulaContext,
  ): IridiumExpression<Metadata> | undefined => {
    try {
      return compileFormulaOriginal(formula, resolveVariable);
    } catch (err) {
      if (err === GOT_DELETED_SYMBOL) {
        return undefined;
      }

      throw err;
    }
  };

  const compileStoichiometry = (
    stoichiometry: StoichiometryContext,
  ): IridiumExpression<Metadata> | undefined => {
    try {
      return compileStoichiometryOriginal(stoichiometry, resolveVariable);
    } catch (err) {
      if (err === GOT_DELETED_SYMBOL) {
        return undefined;
      }

      throw err;
    }
  };

  const reactionInvolvedVariables = new Set<AntimonyObject>();
  for (const reaction of reactions) {
    let rate: IridiumExpression<Metadata>;

    if (reaction.rate) {
      rate = compileFormulaInModel(reaction.rate) ?? {
        kind: "number",
        value: 0,
      };
    } else {
      rate = { kind: "number", value: 0 };
    }

    const reactants: IridiumReactionTerm<Metadata>[] = [];
    for (const reactant of reaction.reactants) {
      // Ignore const since they won't be affected by the reaction.
      const variable = resolveReference(model, reactant.reference);
      if (
        variable.kind === "variable" &&
        (variable.isConst || variable.isDeleted)
      )
        continue;
      reactionInvolvedVariables.add(variable);
      reactants.push({
        name: builder.getNameOf(variable),
        stoichiometry: (reactant.stoichiometry &&
          compileStoichiometry(reactant.stoichiometry)) || {
          kind: "number",
          value: 1,
        },
      });
    }

    const products: IridiumReactionTerm<Metadata>[] = [];
    for (const product of reaction.products) {
      // Ignore const since they won't be affected by the reaction.
      const variable = resolveReference(model, product.reference);
      if (
        variable.kind === "variable" &&
        (variable.isConst || variable.isDeleted)
      )
        continue;
      reactionInvolvedVariables.add(variable);
      products.push({
        name: builder.getNameOf(variable),
        stoichiometry: (product.stoichiometry &&
          compileStoichiometry(product.stoichiometry)) || {
          kind: "number",
          value: 1,
        },
      });
    }

    builder.addReaction(reaction, {
      reactants,
      products,
      rate,
    });
  }

  const compartments: Map<AntimonyObject, AntimonyObject[]> = new Map();

  for (const variable of variables) {
    if (variable.variableKind === "species") {
      if (
        variable.assignment === undefined ||
        variable.assignment?.kind === "initial"
      ) {
        if (reactionInvolvedVariables.has(variable)) {
          builder.addVariable(variable, {
            hasSubstanceOnly: variable.hasSubstanceOnly,
            value: {
              kind: "reaction",
              initial:
                (variable.assignment &&
                  compileFormulaInModel(variable.assignment.initial)) ??
                SPECIES_DEFAULT,
            },
          });
        } else {
          builder.addVariable(variable, {
            hasSubstanceOnly: variable.hasSubstanceOnly,
            value: {
              kind: "initial",
              initial:
                (variable.assignment &&
                  compileFormulaInModel(variable.assignment.initial)) ??
                SPECIES_DEFAULT,
            },
          });
        }
      } else {
        if (reactionInvolvedVariables.has(variable)) {
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
          const assignmentExpression = compileFormulaInModel(
            variable.assignment.rule,
          );
          if (!assignmentExpression) {
            value = {
              kind: "initial",
              initial: SPECIES_DEFAULT,
            };
          } else {
            value = {
              kind: "assignment",
              assignment: assignmentExpression,
            };
          }
        } else if (variable.assignment.kind === "rate") {
          const rateExpression = compileFormulaInModel(
            variable.assignment.rate,
          );
          if (!rateExpression) {
            value = {
              kind: "initial",
              initial:
                (variable.assignment.initial &&
                  compileFormulaInModel(variable.assignment.initial)) ??
                SPECIES_DEFAULT,
            };
          } else {
            value = {
              kind: "rate",
              initial:
                (variable.assignment.initial &&
                  compileFormulaInModel(variable.assignment.initial)) ??
                SPECIES_DEFAULT,
              rate: rateExpression,
            };
          }
        } else {
          throw new CompileInvariantError("Unknown variable assignment kind.");
        }

        builder.addVariable(variable, {
          value,
          hasSubstanceOnly: variable.hasSubstanceOnly,
        });
      }
    } else if (
      variable.variableKind === "parameter" ||
      variable.variableKind === "compartment"
    ) {
      let value: IridiumVariableValue<Metadata>;
      const defaultValue =
        variable.variableKind === "compartment"
          ? COMPARTMENT_DEFAULT
          : SPECIES_DEFAULT;

      if (variable.assignment === undefined) {
        value = {
          kind: "initial",
          initial: defaultValue,
        };
      } else if (variable.assignment.kind === "initial") {
        value = {
          kind: "initial",
          initial:
            compileFormulaInModel(variable.assignment.initial) ?? defaultValue,
        };
      } else if (variable.assignment.kind === "rule") {
        const assignmentExpression = compileFormulaInModel(
          variable.assignment.rule,
        );
        if (!assignmentExpression) {
          value = {
            kind: "initial",
            initial: defaultValue,
          };
        } else {
          value = {
            kind: "assignment",
            assignment: assignmentExpression,
          };
        }
      } else if (variable.assignment.kind === "rate") {
        const rateExpression = compileFormulaInModel(variable.assignment.rate);
        if (!rateExpression) {
          value = {
            kind: "initial",
            initial:
              (variable.assignment.initial &&
                compileFormulaInModel(variable.assignment.initial)) ??
              defaultValue,
          };
        } else {
          value = {
            kind: "rate",
            initial:
              (variable.assignment.initial &&
                compileFormulaInModel(variable.assignment.initial)) ??
              defaultValue,
            rate: rateExpression,
          };
        }
      } else {
        throw new CompileInvariantError("Unknown variable assignment kind.");
      }

      builder.addVariable(variable, {
        value,
        hasSubstanceOnly: variable.hasSubstanceOnly,
      });
    }

    if (variable.compartment) {
      const compartment = resolveReference(model, variable.compartment);
      if (!("isDeleted" in compartment) || !compartment.isDeleted) {
        if (!compartments.has(compartment)) {
          compartments.set(compartment, [variable]);
        } else {
          compartments.get(compartment)!.push(variable);
        }
      }
    }
  }

  for (const event of events) {
    const triggerExpression = compileFormulaInModel(event.trigger);
    if (!triggerExpression) continue;

    const assignments = [];

    for (const [reference, value] of event.assignments) {
      const object = resolveReference(model, reference);
      if ("isDeleted" in object && object.isDeleted) continue;

      const assignmentExpression = compileFormulaInModel(value);
      if (!assignmentExpression) continue;

      assignments.push({
        name: builder.getNameOf(object),
        value: assignmentExpression,
      });
    }

    if (assignments.length === 0) continue;

    const iridiumEvent: Omit<IridiumEvent<Metadata>, "name"> = {
      trigger: triggerExpression,
      assignments: assignments,
      isPersistent: event.options.persistent
        ? evaluateBoolean(event.options.persistent)
        : true,
      isFromTrigger: event.options.fromTrigger
        ? evaluateBoolean(event.options.fromTrigger)
        : true,
      isT0: event.options.t0 ? evaluateBoolean(event.options.t0) : true,
    };

    if (event.delay) {
      iridiumEvent.delay = compileFormula(event.delay, resolveVariable);
    }

    if (event.options.priority) {
      iridiumEvent.priority = compileFormula(
        event.options.priority,
        resolveVariable,
      );
    }

    builder.addEvent(event, iridiumEvent);
  }

  for (const [container, contained] of compartments) {
    builder.addCompartment(container, contained);
  }
};

const resolveFunctionScopeVariable = (variable: VariableContext): string => {
  if (!(variable instanceof NameContext)) {
    throw new CompileError(
      "cannot use subvariables or constants inside a function.",
      { tree: variable },
    );
  }
  return variable.NAME().text;
};

export const compileToIridium = (
  document: AntimonyDocument,
): IridiumModel<Metadata> => {
  const builder = new IrBuilder();
  const exportedModel = document.models.get(document.exportedModel)!;

  for (const func of document.functions.values()) {
    builder.addFunction(func, {
      name: func.name,
      parameters: func.parameters,
      body: compileFormula(func.body, resolveFunctionScopeVariable),
    });
  }

  addAllSources(exportedModel, builder);

  compileModel(exportedModel, builder, document);

  return builder.build();
};

export const compile = async (source: string): Promise<RuntimeModel> => {
  const document = buildAntimonyDocument(source);
  const ir = compileToIridium(document);
  return await compileIridium(ir);
};
