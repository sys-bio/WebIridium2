import type { ModelSpec } from "../modelSpec";

export const getArrayValue = (
  array: Float64Array,
  spec: ModelSpec,
  variable: string,
  index: number,
): number => {
  let i = 0;
  const rowLength = spec.y.length + spec.p.length + spec.reactions.length + 1;

  for (const y of spec.y) {
    if (y.name === variable) {
      return array[rowLength * index + i];
    }

    i += 1;
  }

  for (const p of spec.p) {
    if (p.name === variable) {
      return array[rowLength * index + i];
    }

    i += 1;
  }

  throw new Error(`${variable} not found`);
};

export const resultToString = (
  spec: ModelSpec,
  numPoints: number,
  result: Float64Array,
): string => {
  const builder: string[] = [];

  builder.push("Time,");

  for (const y of spec.y) {
    builder.push(y.name);
    builder.push(",");
  }

  for (const p of spec.p) {
    builder.push(p.name);
    builder.push(",");
  }

  for (const reaction of spec.reactions) {
    builder.push(reaction);
    builder.push(",");
  }

  // remove extra last comma
  builder.pop();

  builder.push("\n");

  const cols = spec.y.length + spec.p.length + spec.reactions.length + 1;

  for (let y = 0; y < numPoints; y++) {
    // push time first
    builder.push(result[cols * (y + 1) - 1].toString() + ",");

    for (let x = 0; x < cols - 1; x++) {
      builder.push(result[x + cols * y].toString());
      if (x < cols - 2) {
        builder.push(",");
      }
    }
    if (y < numPoints - 1) {
      builder.push("\n");
    }
  }

  return builder.join("");
};
