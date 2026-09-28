import { walkExpression, type IridiumExpressionListener } from "../ir/ast";
import type {
  IridiumAlgebraicRule,
  IridiumModel,
  IridiumVariable,
} from "../ir/model";
import type { UnknownAttrs } from "./attrs";
import { SbmlCompileInternalError } from "./errors";

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

  getUniqueAlgebraicRuleId(): string {
    let i = 0;
    let id: string;
    do {
      id = `$algebraic`;
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

  addAlgebraicRule(rule: IridiumAlgebraicRule): void {
    this.ir.algebraicRules.push(rule);
  }

  getVariable(id: string): IridiumVariable | undefined {
    return (
      this.parameters.get(id) ??
      this.species.get(id) ??
      this.compartments.get(id) ??
      this.speciesReferences.get(id)
    );
  }

  isConstant(id: string): boolean {
    return this.constants.has(id);
  }

  isBoundary(id: string): boolean {
    return this.boundaryConditions.has(id);
  }

  getOutput(): IridiumModel {
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

    for (const rule of this.ir.algebraicRules) {
      walkExpression(rule.expression, listener);
    }

    return this.ir;
  }
}
