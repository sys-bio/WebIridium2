import type {
  AntimonyVariable,
  AntimonyEvent,
  AntimonyReaction,
  AntimonyModel,
} from "antimony-language/semantic";
import { IndexSymbolTable } from "./SymbolTable";

/**
 * Internal representation of a model for compilation.
 */
export type InternalModel = {
  variables: Map<string, AntimonyVariable>;
  floatingSpecies: AntimonyVariable[];
  odes: AntimonyVariable[];
  boundarySpecies: AntimonyVariable[];
  parameters: AntimonyVariable[];
  reactions: AntimonyReaction[];
  events: AntimonyEvent[];
  yTable: IndexSymbolTable;
  pTable: IndexSymbolTable;
};

export const createInternalModel = (models: AntimonyModel[]): InternalModel => {
  // TODO: combine all the models into one
  const mainModel = models[0];

  const floatingSpecies: AntimonyVariable[] = [];
  const odes: AntimonyVariable[] = [];
  const boundarySpecies: AntimonyVariable[] = [];
  const parameters: AntimonyVariable[] = [];

  for (const variable of mainModel.variables.values()) {
    if (variable.kind === "species") {
      if (variable.isConst) {
        boundarySpecies.push(variable);
      } else {
        floatingSpecies.push(variable);
      }
    } else if (variable.kind === "parameter") {
      if (variable.assignment?.kind === "rate") {
        odes.push(variable);
      } else {
        parameters.push(variable);
      }
    } else {
      throw new Error(`Unknown variable kind`);
    }
  }

  const yTable = new IndexSymbolTable();
  for (const f of floatingSpecies) {
    yTable.add(f.name);
  }
  for (const o of odes) {
    yTable.add(o.name);
  }

  const pTable = new IndexSymbolTable();
  for (const b of boundarySpecies) {
    pTable.add(b.name);
  }
  for (const p of parameters) {
    pTable.add(p.name);
  }
  for (const name of mainModel.reactions.keys()) {
    pTable.add(name);
  }

  return {
    variables: mainModel.variables,
    floatingSpecies,
    odes,
    boundarySpecies,
    parameters,
    reactions: Array.from(mainModel.reactions.values()),
    events: mainModel.events,
    yTable,
    pTable,
  };
};
