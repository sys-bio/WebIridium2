import {
  ConstantContext,
  NameContext,
  SubvariableContext,
  VariableContext,
} from "../grammar";

export const getVariableName = (variableCtx: VariableContext): string => {
  if (variableCtx instanceof NameContext) {
    return variableCtx.NAME().text;
  } else if (variableCtx instanceof SubvariableContext) {
    throw new Error("subvariables not yet supported");
  } else if (variableCtx instanceof ConstantContext) {
    return getVariableName(variableCtx.variable());
  } else {
    throw new Error(`unknown variable type: ${variableCtx.text}`);
  }
};
