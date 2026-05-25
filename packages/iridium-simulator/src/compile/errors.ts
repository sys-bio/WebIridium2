import { ParseTreeError } from "antimony-language/errors";

/**
 * Represents a compile error that occurs at a specific point.
 */
export class CompileError extends ParseTreeError {}

/**
 * Represents a compile error that occurs for the whole model.
 */
export class CompileModelError extends Error {}

/**
 * Represents a compile error that occurs when an INTERNAL invariant
 * is broken.
 */
export class CompileInvariantError extends Error {}
