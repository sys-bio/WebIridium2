import type { IridiumModel } from "../ir/model";

// We need to delete the metadata since vitest will explode when trying to toMatchObject with it
const deleteMetadata = (obj: Record<string, unknown>): void => {
  for (const key in obj) {
    if (key === "metadata") {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      deleteMetadata(obj[key] as Record<string, unknown>);
    }
  }
};

const deleteMetadataFromArray = (arr: Record<string, unknown>[]): void => {
  for (const obj of arr) {
    deleteMetadata(obj);
  }
};

export const toComparableModel = (
  model: IridiumModel,
): Record<string, unknown> => {
  deleteMetadataFromArray(model.variables);
  deleteMetadataFromArray(model.reactions);
  deleteMetadataFromArray(model.events);
  deleteMetadataFromArray(model.compartments);
  deleteMetadataFromArray(model.functions);
  if (model.conversionFactor) {
    deleteMetadata(model.conversionFactor);
  }

  return {
    variables: Object.fromEntries(model.variables.map((v) => [v.name, v])),
    reactions: Object.fromEntries(model.reactions.map((v) => [v.name, v])),
    events: Object.fromEntries(model.events.map((v) => [v.name, v])),
    compartments: model.compartments,
    functions: model.functions,
    conversionFactor: model.conversionFactor,
  };
};
