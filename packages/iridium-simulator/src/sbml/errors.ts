export class SbmlCompileInternalError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SbmlCompileInternalError";
  }
}

export class SbmlCompileError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SbmlCompileError";
  }
}
