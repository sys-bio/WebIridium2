export type RuntimeVariable = {
  name: string;
  initialValue: number;
};

export type RuntimeEvent = {
  numRoots: number;
  yIndices: number[];
  pIndices: number[];
  isPersistent: boolean;
  isFromTrigger: boolean;
  isT0: boolean;
  getDelayExport?: string;
  getPriorityExport?: string;
  getAssignmentsExport: string;
  setAssignmentsExport: string;
};

/**
 * These are "fake" events used by piecewise functions
 * to keep track of which conditions are triggered.
 */
export type RuntimePieceEvent = {
  isForPiecewise: true;
  numRoots: number;
};

export type RuntimeModel = {
  y: RuntimeVariable[];
  p: RuntimeVariable[];
  /** Name of reactions. */
  reactions: string[];
  events: (RuntimeEvent | RuntimePieceEvent)[];
  wasmModule: WebAssembly.Module;
  funcImports: string[];
};
