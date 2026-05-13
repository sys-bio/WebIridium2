export interface VariableSpec {
  name: string;
  initialValue: number;
}

export interface ModelSpec {
  floatingSpecies: VariableSpec[];
  odes: VariableSpec[];
  boundarySpecies: VariableSpec[];
  parameters: VariableSpec[];
  reactions: string[];
  rhsModule: WebAssembly.Module;
  funcImports: string[];
}
