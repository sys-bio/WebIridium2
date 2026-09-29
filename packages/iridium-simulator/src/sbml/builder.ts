import { walkExpression, type IridiumExpressionListener } from "../ir/ast";
import type {
  IridiumAlgebraicRule,
  IridiumEvent,
  IridiumFunction,
  IridiumModel,
  IridiumReaction,
  IridiumVariable,
} from "../ir/model";
import type { UnknownAttrs } from "./attrs";
import { SbmlCompileError, SbmlCompileInternalError } from "./errors";

/**
 * These are for things we want to run after everything else has been initialized.
 * This is to ensure all IDs have been resolved.
 *
 * timeline:
 *   - main build phase
 *   - delayed build phase
 *   - final ir
 */
export interface DelayedBuildable {
  build(isDelayed: boolean): void;
}

export class Builder {
  #ir: IridiumModel;

  #ids: Set<string>;
  #boundaryConditions: Set<string>;
  #constants: Set<string>;

  #species: Map<string, IridiumVariable>;
  #parameters: Map<string, IridiumVariable>;
  #compartments: Map<string, IridiumVariable>;
  #speciesReferences: Map<string, IridiumVariable>;
  #reactions: Map<string, IridiumReaction>;

  #compartmentArrays: Map<string, string[]>;

  #isDone: boolean;
  #delayedBuildables: DelayedBuildable[];

  constructor() {
    this.#ir = {
      variables: [],
      reactions: [],
      compartments: [],
      events: [],
      algebraicRules: [],
      functions: [],
    };
    this.#ids = new Set();

    this.#boundaryConditions = new Set();
    this.#constants = new Set();

    this.#species = new Map();
    this.#parameters = new Map();
    this.#compartments = new Map();
    this.#speciesReferences = new Map();
    this.#reactions = new Map();

    this.#compartmentArrays = new Map();

    this.#isDone = true;
    this.#delayedBuildables = [];
  }

  getId(attrs: UnknownAttrs): string {
    const id = attrs["id"];
    if (id === undefined) throw new SbmlCompileInternalError(`missing "id".`);
    if (this.#ids.has(id))
      throw new SbmlCompileInternalError("Duplicate id: " + id);
    this.#ids.add(id);
    return id;
  }

  getRef(attrs: UnknownAttrs, key: string): string {
    const ref = attrs[key];
    if (ref === undefined)
      throw new SbmlCompileInternalError(`missing "${key}".`);
    if (!this.#ids.has(ref))
      throw new SbmlCompileInternalError(`Invalid ${key} id: ${ref}.`);
    this.#ids.add(ref);
    return ref;
  }

  getCompartment(attrs: UnknownAttrs): string {
    const compartment = attrs["compartment"];
    if (compartment === undefined)
      throw new SbmlCompileInternalError(`missing "compartment".`);
    if (!this.#compartmentArrays.has(compartment)) {
      throw new SbmlCompileInternalError(
        `Invalid compartment: ${compartment}.`,
      );
    }
    return compartment;
  }

  getUniqueLocalParameterId(reactionId: string, parameterId: string): string {
    let i = 0;
    let id: string;
    do {
      id = `$local;${reactionId};${parameterId};${i}`;
      i += 1;
    } while (this.#ids.has(id));

    this.#ids.add(id);

    return id;
  }

  getUniqueAlgebraicRuleId(): string {
    let i = 0;
    let id: string;
    do {
      id = `$algebraic;${i}`;
      i += 1;
    } while (this.#ids.has(id));

    this.#ids.add(id);

    return id;
  }

  getUniqueEventId(): string {
    let i = 0;
    let id: string;
    do {
      id = `$event;${i}`;
      i += 1;
    } while (this.#ids.has(id));

    this.#ids.add(id);

    return id;
  }

  addConstant(id: string): void {
    this.#constants.add(id);
  }

  addBoundary(id: string): void {
    this.#boundaryConditions.add(id);
  }

  addToCompartmentList(compartment: string, id: string): void {
    this.#compartmentArrays.get(compartment)!.push(id);
  }

  addSpecies(variable: IridiumVariable): void {
    this.#ir.variables.push(variable);
    this.#species.set(variable.name, variable);
  }

  addParameter(variable: IridiumVariable): void {
    this.#ir.variables.push(variable);
    this.#parameters.set(variable.name, variable);
  }

  addCompartment(variable: IridiumVariable): void {
    this.#ir.variables.push(variable);
    this.#compartments.set(variable.name, variable);

    const list: string[] = [];
    this.#compartmentArrays.set(variable.name, list);
    this.#ir.compartments.push({
      containerVariable: variable.name,
      containedVariables: list,
    });
  }

  addSpeciesReference(variable: IridiumVariable): void {
    this.#ir.variables.push(variable);
    this.#speciesReferences.set(variable.name, variable);
  }

  addHiddenVariable(variable: IridiumVariable): void {
    this.#ir.variables.push(variable);
  }

  addReaction(reaction: IridiumReaction): void {
    this.#ir.reactions.push(reaction);
    this.#reactions.set(reaction.name, reaction);
  }

  addAlgebraicRule(rule: IridiumAlgebraicRule): void {
    this.#ir.algebraicRules.push(rule);
  }

  addEvent(event: IridiumEvent): void {
    this.#ir.events.push(event);
  }

  addFunction(func: IridiumFunction): void {
    this.#ir.functions.push(func);
  }

  addDelayedBuildable(buildable: DelayedBuildable): void {
    if (this.#isDone) return;
    this.#delayedBuildables.push(buildable);
  }

  getSpecies(id: string): IridiumVariable | undefined {
    return this.#species.get(id);
  }

  getVariable(id: string): IridiumVariable | undefined {
    return (
      this.#parameters.get(id) ??
      this.#species.get(id) ??
      this.#compartments.get(id) ??
      this.#speciesReferences.get(id)
    );
  }

  getReaction(id: string): IridiumReaction | undefined {
    return this.#reactions.get(id);
  }

  isConstant(id: string): boolean {
    return this.#constants.has(id);
  }

  isBoundary(id: string): boolean {
    return this.#boundaryConditions.has(id);
  }

  getOutput(): IridiumModel {
    this.#isDone = true;

    try {
      for (const buildable of this.#delayedBuildables) {
        buildable.build(true);
      }
    } catch (err) {
      if (err instanceof SbmlCompileInternalError) {
        throw new SbmlCompileError(err.message, { cause: err });
      }

      throw err;
    }

    const listener: IridiumExpressionListener = {
      afterVariable: ({ name }) => {
        if (this.isConstant(name)) return;

        const variable = this.getVariable(name);
        if (variable) {
          if (variable.value.kind !== "initial") return;
          variable.value = { ...variable.value, kind: "algebraic" };
        }
      },
    };

    for (const rule of this.#ir.algebraicRules) {
      walkExpression(rule.expression, listener);
    }

    return this.#ir;
  }
}
