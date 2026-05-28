export const TIME_NAME = "time";

export const builtinEventOptions = [
  "t0",
  "priority",
  "fromTrigger",
  "persistent",
];

export const isBuiltinName = (name: string): boolean => {
  return name === TIME_NAME;
};
