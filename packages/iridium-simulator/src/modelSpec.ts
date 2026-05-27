export type VariableSpec = {
  kind: "floating" | "boundary" | "parameter" | "compartment";
  name: string;
  initialValue?: number;
};

export type EventSpec = {
  countRoots: number;
  yIndices: number[];
  pIndices: number[];
  getDelayExport: string;
  getAssignmentsExport: string;
};

/**
 * Contains all the information needed to load and execute a model.
 * Meant to be shared between workers.
 */
export type ModelSpec = {
  y: VariableSpec[];
  p: VariableSpec[];
  /** Name of reactions. */
  reactions: string[];
  events: EventSpec[];
  wasmModule: WebAssembly.Module;
  funcImports: string[];
};
