import type {
  IridiumEvent,
  IridiumModel,
  IridiumParameter,
  IridiumReaction,
  IridiumSpecies,
} from "../ir/model";
import { IndexSymbolTable } from "./symbolTables";
import { CompileInvariantError } from "./errors";
import type { IridiumExpression } from "../ir/ast";

/**
 * Coordinating object for a compilation pass, maintaining relevant state.
 */
export class Compilation {
  species: Map<string, IridiumSpecies>;
  parameters: Map<string, IridiumParameter>;
  reactions: Map<string, IridiumReaction>;
  events: Map<string, IridiumEvent>;

  yVars: string[];
  pVars: string[];

  yTable: IndexSymbolTable;
  pTable: IndexSymbolTable;

  piecewisePieces: Map<IridiumExpression, number>;

  constructor(model: IridiumModel) {
    this.species = new Map(model.species.map((s) => [s.name, s]));
    this.parameters = new Map(model.parameters.map((p) => [p.name, p]));
    this.reactions = new Map(model.reactions.map((r) => [r.name, r]));
    this.events = new Map(model.events.map((e) => [e.name, e]));

    this.piecewisePieces = new Map();

    this.yVars = [];
    this.pVars = [];

    for (const species of model.species) {
      this.yVars.push(species.name);
    }

    for (const parameter of model.parameters) {
      if (parameter.value.kind === "rate") {
        this.yVars.push(parameter.name);
      } else {
        this.pVars.push(parameter.name);
      }
    }

    this.yTable = new IndexSymbolTable();
    for (const name of this.yVars) {
      this.yTable.add(name);
    }

    this.pTable = new IndexSymbolTable();
    for (const name of this.pVars) {
      this.pTable.add(name);
    }
    for (const reaction of model.reactions) {
      this.pTable.add(reaction.name);
    }
  }

  addPiecewisePiece(condition: IridiumExpression): number {
    if (this.piecewisePieces.has(condition)) {
      throw new CompileInvariantError("Duplicate piecewise index.");
    }

    const index = this.piecewisePieces.size;
    this.piecewisePieces.set(condition, index);
    return index;
  }

  getPiecewisePiece(condition: IridiumExpression): number {
    const index = this.piecewisePieces.get(condition);
    if (index === undefined) {
      throw new CompileInvariantError("Missing piecewise index?");
    }

    return index;
  }

  forAllExpressions(callback: (expr: IridiumExpression) => void): void {
    for (const species of this.species.values()) {
      callback(species.initial);
    }

    for (const parameter of this.parameters.values()) {
      if (parameter.value.kind === "initial") {
        callback(parameter.value.initial);
      } else if (parameter.value.kind === "rate") {
        callback(parameter.value.initial);
        callback(parameter.value.rate);
      } else if (parameter.value.kind === "assignment") {
        callback(parameter.value.assignment);
      }
    }

    for (const event of this.events.values()) {
      callback(event.trigger);

      if (event.delay) {
        callback(event.delay);
      }

      if (event.priority) {
        callback(event.priority);
      }

      for (const assignment of event.assignments) {
        callback(assignment.value);
      }
    }

    for (const reaction of this.reactions.values()) {
      callback(reaction.rate);
    }
  }
}
