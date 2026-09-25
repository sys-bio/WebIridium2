export class SbmlCompileInternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SbmlCompileInternalError";
  }
}

export class SbmlCompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SbmlCompileError";
  }
}
