import { SbmlCompileInternalError } from "./errors";

export type UnknownAttr = number | string | boolean;
export type UnknownAttrs = Record<string, string>;

export const getString = (
  attrs: UnknownAttrs,
  key: string,
  defaultValue?: string,
): string => {
  const value = attrs[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new SbmlCompileInternalError(`missing "${key}".`);
    } else {
      return defaultValue;
    }
  }
  return value;
};

export const getBool = (
  attrs: UnknownAttrs,
  key: string,
  defaultValue?: boolean,
): boolean => {
  const value = attrs[key];
  if (value === undefined) {
    if (defaultValue === undefined)
      throw new SbmlCompileInternalError(`missing "${key}".`);
    else return defaultValue;
  }
  if (value === "true" || value === "1") {
    return true;
  } else if (value === "false" || value === "0") {
    return false;
  } else {
    throw new SbmlCompileInternalError(`"${key}" must be bool.`);
  }
};

export const getNumber = (
  attrs: UnknownAttrs,
  key: string,
  defaultValue?: number,
): number => {
  const value = attrs[key];
  if (value === undefined) {
    if (defaultValue === undefined)
      throw new SbmlCompileInternalError(`missing "${key}".`);
    else return defaultValue;
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    throw new SbmlCompileInternalError(`"${key}" must be number.`);
  } else {
    return number;
  }
};
