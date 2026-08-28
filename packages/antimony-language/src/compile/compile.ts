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
  AntimonyFormula,
  AntimonyModel,
  AntimonyObject,
  AntimonyReaction,
  AntimonyStoichiometry,
  AntimonyVariable,
} from "../semantic/model";
import {
  compileFormula as compileFormulaOriginal,
  compileStoichiometry as compileStoichiometryOriginal,
} from "./formula";
import type { Metadata } from "./metadata";
import { CompileError, CompileInvariantError } from "../errors";
import { FormulaContext, NameContext, VariableContext } from "../grammar";
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
  #compartments: Map<string, string[]>;
  #prefixes: string[];

  constructor() {
    this.#ir = {
      variables: [],
      compartments: [],
      reactions: [],
      events: [],
      functions: [],
    };
    this.#compartments = new Map();
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

  addToCompartment(
    containerSource: AntimonyObject,
    containedSource: AntimonyObject,
  ): void {
    const containerName = this.getNameOf(containerSource);
    const containedName = this.getNameOf(containedSource);
    let containerArray = this.#compartments.get(containerName);
    if (!containerArray) {
      const containedArray = [containedName];
      this.#compartments.set(containerName, containedArray);
      this.#ir.compartments.push({
        containerVariable: containerName,
        containedVariables: containedArray,
      });
    } else {
      containerArray.push(containedName);
    }
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

const flattenModel = (
  root: AntimonyModel,
  builder: IrBuilder,
): {
  variables: AntimonyVariable[];
  reactions: AntimonyReaction[];
  events: AntimonyEvent[];
} => {
  const variables: AntimonyVariable[] = [];
  const reactions: AntimonyReaction[] = [];
  const events: AntimonyEvent[] = [];

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

    for (const [name, object] of got.objects) {
      if ("isDeleted" in object && object.isDeleted) continue;

      switch (object.kind) {
        case "variable":
          builder.addSource(object);
          variables.push(object);
          break;
        case "reaction":
          builder.addSource(object);
          reactions.push(object);
          break;
        case "event":
          builder.addSource(object);
          events.push(object);
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

  return { variables, reactions, events };
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
  const { variables, reactions, events } = flattenModel(model, builder);

  // We use this variable as a sort of "second" side-channel argument to resolveVariable.
  // since the callback only accepts one parameter.
  let resolveScope = model;

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

    const object = resolveReference(model, reference, resolveScope);

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
    formula: AntimonyFormula,
  ): IridiumExpression<Metadata> | undefined => {
    if (formula.scope) {
      resolveScope = resolveReference(model, formula.scope) as AntimonyModel;
    } else {
      resolveScope = model;
    }

    try {
      return compileFormulaOriginal(formula.ctx, resolveVariable);
    } catch (err) {
      if (err === GOT_DELETED_SYMBOL) {
        return undefined;
      }

      throw err;
    }
  };

  const compileStoichiometryInModel = (
    stoichiometry: AntimonyStoichiometry,
  ): IridiumExpression<Metadata> | undefined => {
    if (stoichiometry.scope) {
      resolveScope = resolveReference(
        model,
        stoichiometry.scope,
      ) as AntimonyModel;
    } else {
      resolveScope = model;
    }

    try {
      return compileStoichiometryOriginal(stoichiometry.ctx, resolveVariable);
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
          compileStoichiometryInModel(reactant.stoichiometry)) || {
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
          compileStoichiometryInModel(product.stoichiometry)) || {
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

  for (const variable of variables) {
    const defaultValue =
      variable.variableKind === "compartment"
        ? COMPARTMENT_DEFAULT
        : SPECIES_DEFAULT;
    let value: IridiumVariableValue<Metadata> | undefined;

    if (reactionInvolvedVariables.has(variable)) {
      if (
        variable.assignment?.kind === "rule" ||
        variable.assignment?.kind === "rate"
      ) {
        throw new CompileError(
          `Species cannot be simultaneously involved in a reaction and determined by a rate/assignment rule`,
          {
            tree:
              variable.assignment.kind === "rule"
                ? variable.assignment.rule.ctx
                : variable.assignment.rate.ctx,
          },
        );
      }

      value = {
        kind: "reaction",
        initial:
          (variable.assignment?.initial &&
            compileFormulaInModel(variable.assignment.initial)) ??
          defaultValue,
      };
    } else if (variable.assignment?.kind === "initial") {
      value = {
        kind: "initial",
        initial:
          compileFormulaInModel(variable.assignment.initial) ?? defaultValue,
      };
    } else if (variable.assignment?.kind === "rule") {
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
    } else if (variable.assignment?.kind === "rate") {
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
      value = { kind: "initial", initial: defaultValue };
    }

    builder.addVariable(variable, {
      value,
      hasSubstanceOnly: variable.hasSubstanceOnly,
    });

    if (variable.compartment) {
      const compartment = resolveReference(model, variable.compartment);
      if (!("isDeleted" in compartment) || !compartment.isDeleted) {
        builder.addToCompartment(compartment, variable);
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
        ? evaluateBoolean(event.options.persistent.ctx)
        : true,
      isFromTrigger: event.options.fromTrigger
        ? evaluateBoolean(event.options.fromTrigger.ctx)
        : true,
      isT0: event.options.t0 ? evaluateBoolean(event.options.t0.ctx) : true,
    };

    if (event.delay) {
      iridiumEvent.delay = compileFormulaInModel(event.delay);
    }

    if (event.options.priority) {
      iridiumEvent.priority = compileFormulaInModel(event.options.priority);
    }

    builder.addEvent(event, iridiumEvent);
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
      body: compileFormulaOriginal(func.body, resolveFunctionScopeVariable),
    });
  }

  compileModel(exportedModel, builder, document);

  return builder.build();
};

export const compile = async (source: string): Promise<RuntimeModel> => {
  const document = buildAntimonyDocument(source);
  const ir = compileToIridium(document);
  return await compileIridium(ir);
};
