import type {
  AntimonyVariable,
  AntimonyEvent,
  AntimonyReaction,
  AntimonyModel,
} from "antimony-language/semantic";
import { IndexSymbolTable } from "./symbolTables.ts";

/**
 * Internal representation of a model for compilation.
 */
export type InternalModel = {
  variables: Map<string, AntimonyVariable>;
  yVars: AntimonyVariable[];
  pVars: AntimonyVariable[];
  reactions: AntimonyReaction[];
  events: AntimonyEvent[];
  yTable: IndexSymbolTable;
  pTable: IndexSymbolTable;
};

export const createInternalModel = (models: AntimonyModel[]): InternalModel => {
  // TODO: combine all the models into one
  const mainModel = models[0];

  const yVars: AntimonyVariable[] = [];
  const pVars: AntimonyVariable[] = [];

  for (const variable of mainModel.variables.values()) {
    if (variable.kind === "species") {
      if (variable.isConst) {
        pVars.push(variable);
      } else {
        if (variable.assignment?.kind === "rule") {
          pVars.push(variable);
        } else {
          yVars.push(variable);
        }
      }
    } else if (variable.kind === "parameter") {
      if (variable.assignment?.kind === "rate") {
        yVars.push(variable);
      } else {
        pVars.push(variable);
      }
    } else if (variable.kind === "compartment") {
      pVars.push(variable);
    } else {
      throw new Error(`Unknown variable kind`);
    }
  }

  const yTable = new IndexSymbolTable();
  for (const variable of yVars) {
    yTable.add(variable.name);
  }

  const pTable = new IndexSymbolTable();
  for (const variable of pVars) {
    pTable.add(variable.name);
  }
  for (const name of mainModel.reactions.keys()) {
    pTable.add(name);
  }

  return {
    variables: mainModel.variables,
    yVars,
    pVars,
    reactions: Array.from(mainModel.reactions.values()),
    events: mainModel.events,
    yTable,
    pTable,
  };
};
