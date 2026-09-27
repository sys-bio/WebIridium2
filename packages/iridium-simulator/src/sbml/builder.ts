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
  parameters: Map<string, IridiumVariable>;
  compartments: Map<string, IridiumVariable>;
  speciesReferences: Map<string, IridiumVariable>;

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
    this.parameters = new Map();
    this.compartments = new Map();
    this.speciesReferences = new Map();

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

  getRef(attrs: UnknownAttrs, key: string): string {
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

  getString(attrs: UnknownAttrs, key: string, defaultValue?: string): string {
    const value = attrs[key];
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new SbmlCompileInternalError(`missing "${key}".`);
      } else {
        return defaultValue;
      }
    }
    return value;
  }

  getBool(attrs: UnknownAttrs, key: string, defaultValue?: boolean): boolean {
    const value = attrs[key];
    if (value === undefined) {
      if (defaultValue === undefined)
        throw new SbmlCompileInternalError(`missing "${key}".`);
      else return defaultValue;
    }
    if (value === "true" || value === "1") {
      return true;
    } else if (value === "false" || value === "0") {
      return false;
    } else {
      throw new SbmlCompileInternalError(`"${key}" must be bool.`);
    }
  }

  getNumber(attrs: UnknownAttrs, key: string, defaultValue?: number): number {
    const value = attrs[key];
    if (value === undefined) {
      if (defaultValue === undefined)
        throw new SbmlCompileInternalError(`missing "${key}".`);
      else return defaultValue;
    }
    const number = Number(value);
    if (Number.isNaN(number)) {
      throw new SbmlCompileInternalError(`"${key}" must be number.`);
    } else {
      return number;
    }
  }

  getUniqueLocalParameterId(reactionId: string, parameterId: string): string {
    let i = 0;
    let id: string;
    do {
      id = `$local;${reactionId};${parameterId}`;
      if (i > 0) {
        id += ";" + i;
      }
      i += 1;
    } while (this.ids.has(id));

    this.ids.add(id);

    return id;
  }

  addToCompartmentList(compartment: string, id: string): void {
    this.#compartmentArrays.get(compartment)!.push(id);
  }

  addSpecies(variable: IridiumVariable): void {
    this.ir.variables.push(variable);
    this.species.set(variable.name, variable);
  }

  addParameter(variable: IridiumVariable): void {
    this.ir.variables.push(variable);
    this.parameters.set(variable.name, variable);
  }

  addCompartment(variable: IridiumVariable): void {
    this.ir.variables.push(variable);
    this.compartments.set(variable.name, variable);

    const list: string[] = [];
    this.#compartmentArrays.set(variable.name, list);
    this.ir.compartments.push({
      containerVariable: variable.name,
      containedVariables: list,
    });
  }

  addSpeciesReference(variable: IridiumVariable): void {
    this.ir.variables.push(variable);
    this.speciesReferences.set(variable.name, variable);
  }
}
