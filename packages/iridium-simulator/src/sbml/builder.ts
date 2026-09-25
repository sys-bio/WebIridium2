import type { IridiumModel, IridiumVariable } from "../ir/model";
import { SbmlCompileInternalError } from "./errors";

export type UnknownAttr = number | string | boolean;
export type UnknownAttrs = Record<string, string>;

export class Builder {
  ir: IridiumModel;

  ids: Set<string>;
  boundaryConditions: Set<string>;
  constants: Set<string>;

  species: Map<string, IridiumVariable>;

  #compartmentArrays: Map<string, string[]>;

  constructor() {
    this.ir = {
      variables: [],
      reactions: [],
      compartments: [],
      events: [],
      algebraicRules: [],
      functions: [],
    };
    this.ids = new Set();

    this.boundaryConditions = new Set();
    this.constants = new Set();

    this.species = new Map();

    this.#compartmentArrays = new Map();
  }

  getId(attrs: UnknownAttrs): string {
    const id = attrs["id"];
    if (id === undefined) throw new SbmlCompileInternalError(`missing "id".`);
    if (this.ids.has(id))
      throw new SbmlCompileInternalError("Duplicate id: " + id);
    this.ids.add(id);
    return id;
  }

  getRef(attrs: UnknownAttrs, key?: string): string {
    key ??= "symbol";
    const ref = attrs[key];
    if (ref === undefined)
      throw new SbmlCompileInternalError(`missing "${key}".`);
    if (!this.ids.has(ref))
      throw new SbmlCompileInternalError(`Invalid ${key} id: ${ref}.`);
    this.ids.add(ref);
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

  getString(attrs: UnknownAttrs, key: string): string {
    const value = attrs[key];
    if (value === undefined)
      throw new SbmlCompileInternalError(`missing "${key}".`);
    return value;
  }

  getBool(attrs: UnknownAttrs, key: string): boolean {
    const value = attrs[key];
    if (value === undefined)
      throw new SbmlCompileInternalError(`missing "${key}".`);
    if (value === "true" || value === "1") {
      return true;
    } else if (value === "false" || value === "0") {
      return false;
    } else {
      throw new SbmlCompileInternalError(`"${key}" must be bool.`);
    }
  }

  getNumber(attrs: UnknownAttrs, key: string): number {
    const value = attrs[key];
    if (value === undefined)
      throw new SbmlCompileInternalError(`missing "${key}".`);
    const number = Number(value);
    if (Number.isNaN(number)) {
      throw new SbmlCompileInternalError(`"${key}" must be number.`);
    } else {
      return number;
    }
  }

  createCompartmentList(id: string): void {
    const list: string[] = [];
    this.#compartmentArrays.set(id, list);
    this.ir.compartments.push({
      containerVariable: id,
      containedVariables: list,
    });
  }

  addToCompartmentList(compartment: string, id: string): void {
    this.#compartmentArrays.get(compartment)!.push(id);
  }

  addSpecies(variable: IridiumVariable): void {
    this.ir.variables.push(variable);
    this.species.set(variable.name, variable);
  }

  addVariable(variable: IridiumVariable): void {
    this.ir.variables.push(variable);
  }
}
