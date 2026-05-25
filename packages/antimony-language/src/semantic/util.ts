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
    // TODO: actually handle subvariables properly? or we need a way to just ignore them
    // Right now, just special case some ones that are just annotations
    if (variableCtx.NAME().text === "sboTerm") {
      return (
        getVariableName(variableCtx.variable()) +
        "/@/" +
        variableCtx.NAME().text
      );
    } else {
      throw new Error("subvariables not yet supported");
    }
  } else if (variableCtx instanceof ConstantContext) {
    return getVariableName(variableCtx.variable());
  } else {
    throw new Error(`unknown variable type: ${variableCtx.text}`);
  }
};
