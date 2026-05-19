export interface VariableSpec {
  name: string;
  initialValue: number;
}

/**
 * Contains all the information needed to load and execute a model.
 * Meant to be shared between workers.
 */
export interface ModelSpec {
  floatingSpecies: VariableSpec[];
  odes: VariableSpec[];
  boundarySpecies: VariableSpec[];
  parameters: VariableSpec[];
  reactions: string[];
  rhsModule: WebAssembly.Module;
  event?: {
    roots: number;
    rootModule: WebAssembly.Module;
    foundModule: WebAssembly.Module;
  };
  funcImports: string[];
}
