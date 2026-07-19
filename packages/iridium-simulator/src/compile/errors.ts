export class IridiumError<Metadata = unknown> extends Error {
  metadata: Metadata;

  constructor(message: string, metadata: Metadata) {
    super(message);
    this.metadata = metadata;
  }
}

/**
 * Represents a compile error that occurs at a specific point.
 */
export class CompileError<Metadata = unknown> extends IridiumError<Metadata> {}

/**
 * Represents error evaluating an expression.
 */
export class EvaluationError<
  Metadata = unknown,
> extends IridiumError<Metadata> {}

/**
 * Represents a compile error that occurs for the whole model.
 */
export class CompileModelError extends Error {}

/**
 * Represents a compile error that occurs when an INTERNAL invariant
 * is broken.
 */
export class CompileInvariantError extends Error {}
