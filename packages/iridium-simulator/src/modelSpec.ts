export interface FloatingSpeciesSpec {
  name: string;
  initialValue: number;
}

export interface ParameterSpec {
  name: string;
  initialValue: number;
}

export interface BoundarySpeciesSpec {
  name: string;
  initialValue: number;
}

export interface ModelSpec {
  floatingSpecies: FloatingSpeciesSpec[];
  boundarySpecies: BoundarySpeciesSpec[];
  parameters: ParameterSpec[];
  reactions: string[];
  rhsModule: WebAssembly.Module;
  funcImports: string[];
}
