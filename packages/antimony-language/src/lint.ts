import { RootContext } from "./grammar/AntimonyParser.ts";

export type LintSeverity = "warning" | "error";
const lintSeverityValues: Record<LintSeverity, number> = {
  warning: 1,
  error: 2,
};

export type Lint = {
  severity: LintSeverity;
  message: string;
};

export const isMoreSevere = (lint1: Lint, lint2: Lint): boolean =>
  lintSeverityValues[lint1.severity] > lintSeverityValues[lint2.severity];

export const lint = (code: string): Lint[] => {
  return [];
};
