export const RHS_NAME = "rhs";
export const ROOTS_NAME = "roots";
export const CHECK_EVENTS_NAME = "checkEvents";

export { TIME_NAME } from "antimony-language/semantic/names";

export const CORE_NAMESPACE = "core";
export const MEMORY_IMPORT_NAME = "mem";
export const IMPORT_NAMESPACE = "js";

export const T_PARAM = "t";
export const Y_PARAM = "y[]";
export const P_PARAM = "p[]";

let symbolCounter = 0;

/**
 * Generates a unique symbol name.
 *
 * @param baseName - this is guaranteed to appear in the generated symbol.
 * @returns a unique symbol name (in the current thread)
 */
export const generateSymbol = (baseName: string): string => {
  return `__gen_${baseName}_${symbolCounter++}`;
};
