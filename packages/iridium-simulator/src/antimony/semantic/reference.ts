import {
  ConstantContext,
  NameContext,
  SubvariableContext,
  type VariableContext,
} from "../grammar";
import type {
  AntimonyConcreteObject,
  AntimonyConversionFactor,
  AntimonyModel,
  AntimonyObject,
  AntimonyReference,
} from "./document";

const referenceToString = (reference: AntimonyReference) => reference.join(".");

export const getReferenceFromVariable = (
  variable: VariableContext,
): AntimonyReference => {
  if (variable instanceof NameContext) {
    return [variable.NAME().text];
  } else if (variable instanceof SubvariableContext) {
    return variable.NAME().map((n) => n.text);
  } else if (variable instanceof ConstantContext) {
    return getReferenceFromVariable(variable.variable());
  } else {
    throw new Error(`Unknown variable type: ${variable.text}.`);
  }
};

type ObjectWithModelInfo = [
  model: AntimonyModel,
  name: string | number,
  obj: AntimonyConcreteObject,
  conversionFactors: AntimonyConversionFactor[] | undefined,
];

/**
 * If the object is a renameLink, follow it. Otherwise, return the object.
 */
const resolveObjectWithModelInfo = (
  rootModel: AntimonyModel,
  object: AntimonyObject,
  containingModel: AntimonyModel,
): ObjectWithModelInfo => {
  if (object.kind === "renameLink") {
    const [gotModel, gotName, gotObject, gotConversionFactors] =
      resolveReferenceWithModelInfo(rootModel, object.to);
    if (object.conversionFactor && gotConversionFactors) {
      gotConversionFactors.push(object.conversionFactor);
      return [gotModel, gotName, gotObject, gotConversionFactors];
    } else if (object.conversionFactor) {
      return [gotModel, gotName, gotObject, [object.conversionFactor]];
    } else {
      return [gotModel, gotName, gotObject, gotConversionFactors];
    }
  } else {
    return [containingModel, object.name, object, undefined];
  }
};

export class BadReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadReferenceError";
  }
}

export const resolveReferenceWithModelInfo = (
  rootModel: AntimonyModel,
  reference: AntimonyReference,
  startModel?: AntimonyModel,
): ObjectWithModelInfo => {
  let parent: AntimonyModel = startModel ?? rootModel;
  let current: AntimonyObject = startModel ?? rootModel;

  for (const name of reference) {
    if (current.kind !== "model") {
      throw new BadReferenceError(
        `Cannot access ${current.name} in ${referenceToString(reference)} because it is not a model.`,
      );
    }

    const got: AntimonyObject | undefined =
      typeof name === "number"
        ? current.unnamedImports[name]
        : current.objects.get(name);

    if (!got) {
      throw new BadReferenceError(
        `${name} is not a subvariable of ${current.name}.`,
      );
    }

    parent = current;
    current = got;
  }

  return resolveObjectWithModelInfo(rootModel, current, parent);
};

/**
 * @param rootModel - where any links are resolved from
 * @param reference - reference to resolve
 * @param startModel - an optional model where the reference should start at
 */
export const resolveReference = (
  rootModel: AntimonyModel,
  reference: AntimonyReference,
  startModel?: AntimonyModel,
): [
  object: AntimonyConcreteObject,
  conversionFactors: AntimonyConversionFactor[] | undefined,
] => {
  const [_model, _name, object, conversionFactor] =
    resolveReferenceWithModelInfo(rootModel, reference, startModel);
  return [object, conversionFactor];
};
