import { FormulaContext } from "antimony-language/grammar";
import type {
  AntimonyEvent,
  AntimonyModel,
  AntimonyReaction,
  AntimonyVariable,
} from "antimony-language/semantic";
import { IndexSymbolTable } from "./symbolTables";
import { CompileInvariantError } from "./errors";

/**
 * Coordinating object for a compilation pass, maintaining relevant state.
 */
export class Compilation {
  variables: Map<string, AntimonyVariable>;
  yVars: AntimonyVariable[];
  pVars: AntimonyVariable[];
  reactions: AntimonyReaction[];
  events: AntimonyEvent[];
  piecewisePieces: Map<FormulaContext, number>;
  yTable: IndexSymbolTable;
  pTable: IndexSymbolTable;

  constructor(models: AntimonyModel[]) {
    // TODO: combine all the models into one
    const mainModel = models[0];

    this.variables = mainModel.variables;
    this.reactions = Array.from(mainModel.reactions.values());
    this.events = Array.from(mainModel.events.values());
    this.piecewisePieces = new Map();

    this.yVars = [];
    this.pVars = [];

    for (const variable of mainModel.variables.values()) {
      if (variable.assignment?.kind === "rule") {
        this.pVars.push(variable);
      } else {
        if (variable.kind === "species") {
          if (variable.isConst) {
            this.pVars.push(variable);
          } else {
            this.yVars.push(variable);
          }
        } else {
          if (variable.assignment?.kind === "rate") {
            this.yVars.push(variable);
          } else {
            this.pVars.push(variable);
          }
        }
      }
    }

    this.yTable = new IndexSymbolTable();
    for (const variable of this.yVars) {
      this.yTable.add(variable.name);
    }

    this.pTable = new IndexSymbolTable();
    for (const variable of this.pVars) {
      this.pTable.add(variable.name);
    }
    for (const name of mainModel.reactions.keys()) {
      this.pTable.add(name);
    }
  }

  addPiecewisePiece(condition: FormulaContext): number {
    if (this.piecewisePieces.has(condition)) {
      throw new CompileInvariantError("Duplicate piecewise index.");
    }

    const index = this.piecewisePieces.size;
    this.piecewisePieces.set(condition, index);
    return index;
  }

  getPiecewisePiece(condition: FormulaContext): number {
    const index = this.piecewisePieces.get(condition);
    if (index === undefined) {
      throw new CompileInvariantError("Missing piecewise index?");
    }

    return index;
  }
}
