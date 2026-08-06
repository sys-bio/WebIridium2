import type {
  IridiumEvent,
  IridiumModel,
  IridiumReaction,
  IridiumVariable,
} from "../ir/model";
import { IndexSymbolTable } from "./symbolTables";
import { CompileInvariantError, CompileModelError } from "./errors";
import type { IridiumExpression } from "../ir/ast";

/**
 * Coordinating object for a compilation pass, maintaining relevant state.
 */
export class Compilation {
  variables: Map<string, IridiumVariable>;
  /** Map of a species/parameter and the compartment it belongs to. */
  compartments: Map<string, IridiumVariable>;
  reactions: Map<string, IridiumReaction>;
  events: Map<string, IridiumEvent>;

  yVars: string[];
  pVars: string[];

  yTable: IndexSymbolTable;
  pTable: IndexSymbolTable;

  /**
   * Indexes and conditions for the branches of a piecewise function. Each index corresponds to an event index
   * which will be true when the branch of the piecewise function is true. Note that the branch and condition are
   * not necessarily the same because we compile each branch to a different expression that is only true when the
   * other branches are false.
   */
  piecewisePieces: Map<
    IridiumExpression,
    { index: number; condition: IridiumExpression }
  >;

  constructor(model: IridiumModel) {
    this.variables = new Map(model.variables.map((s) => [s.name, s]));
    this.compartments = new Map();
    this.reactions = new Map(model.reactions.map((r) => [r.name, r]));
    this.events = new Map(model.events.map((e) => [e.name, e]));

    this.piecewisePieces = new Map();

    this.yVars = [];
    this.pVars = [];

    for (const variable of model.variables) {
      if (
        variable.value.kind === "rate" ||
        variable.value.kind === "reaction"
      ) {
        this.yVars.push(variable.name);
      } else {
        this.pVars.push(variable.name);
      }
    }

    for (const {
      containerVariable: containerName,
      containedVariables,
    } of model.compartments) {
      for (const name of containedVariables) {
        const container = this.variables.get(containerName);
        if (!container) {
          throw new CompileModelError(
            `Compartment must be associated with a variable, but no variable with name ${containerName} found.`,
          );
        }
        this.compartments.set(name, container);
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

  addPiecewisePiece(
    branch: IridiumExpression,
    condition: IridiumExpression,
  ): number {
    if (this.piecewisePieces.has(branch)) {
      throw new CompileInvariantError("Duplicate piecewise index.");
    }

    const index = this.piecewisePieces.size;
    this.piecewisePieces.set(branch, { index, condition });
    return index;
  }

  getPiecewisePieceIndex(branch: IridiumExpression): number {
    const piece = this.piecewisePieces.get(branch);
    if (piece === undefined) {
      throw new CompileInvariantError("Missing piecewise index?");
    }

    return piece.index;
  }

  forAllExpressions(callback: (expr: IridiumExpression) => void): void {
    for (const variable of this.variables.values()) {
      if (
        variable.value.kind === "initial" ||
        variable.value.kind === "reaction"
      ) {
        callback(variable.value.initial);
      } else if (variable.value.kind === "rate") {
        callback(variable.value.initial);
        callback(variable.value.rate);
      } else if (variable.value.kind === "assignment") {
        callback(variable.value.assignment);
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
