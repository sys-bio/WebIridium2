export type VariableSpec = {
  name: string;
  initialValue: number;
};

export type EventSpec = {
  countRoots: number;
  yIndices: number[];
  pIndices: number[];
  getDelayExport: string;
  getAssignmentExport: string;
};

/**
 * Contains all the information needed to load and execute a model.
 * Meant to be shared between workers.
 */
export type ModelSpec = {
  floatingSpecies: VariableSpec[];
  odes: VariableSpec[];
  boundarySpecies: VariableSpec[];
  parameters: VariableSpec[];
  /** Name of reactions. */
  reactions: string[];
  events: EventSpec[];
  wasmModule: WebAssembly.Module;
  funcImports: string[];
};
