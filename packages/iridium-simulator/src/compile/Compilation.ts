import type {
  IridiumEvent,
  IridiumFunction,
  IridiumModel,
  IridiumReaction,
  IridiumVariable,
} from "../ir/model";
import { IndexSymbolTable } from "./symbolTables";
import { CompileInvariantError, CompileModelError } from "./errors";
import type { IridiumExpression } from "../ir/ast";
import { AssignmentGraph } from "./graph";
import { expr } from "../ir/dsl";
import { tryEvaluateStoichiometry } from "./evaluate";

/**
 * Coordinating object for a compilation pass, maintaining relevant state.
 */
export class Compilation {
  variables: Map<string, IridiumVariable>;
  /** Map of a species/parameter and the compartment it belongs to. */
  compartments: Map<string, IridiumVariable>;
  reactions: Map<string, IridiumReaction>;
  events: Map<string, IridiumEvent>;
  functions: Map<string, IridiumFunction>;

  /** Assignment graph for non-initial values. */
  assignmentGraph: AssignmentGraph;

  yVars: string[];
  pVars: string[];

  yTable: IndexSymbolTable;
  pTable: IndexSymbolTable;

  /**
   * Indexes and conditions for the branches of a piecewise function. Each index corresponds to an event index
   * which will be true when the branch of the piecewise function is true. Note that the branch and condition are
   * not necessarily the same because we compile each branch to a different expression that is only true when the
   * other branches are false.
   */
  piecewisePieces: Map<
    IridiumExpression,
    { index: number; condition: IridiumExpression }
  >;

  constructor(model: IridiumModel) {
    this.variables = new Map(model.variables.map((s) => [s.name, s]));
    this.compartments = new Map();
    this.reactions = new Map(model.reactions.map((r) => [r.name, r]));
    this.events = new Map(model.events.map((e) => [e.name, e]));
    this.functions = new Map(model.functions.map((e) => [e.name, e]));

    this.piecewisePieces = new Map();

    this.yVars = [];
    this.pVars = [];

    for (const variable of model.variables) {
      if (
        variable.value.kind === "rate" ||
        variable.value.kind === "reaction"
      ) {
        this.yVars.push(variable.name);
      } else {
        this.pVars.push(variable.name);
      }
    }

    for (const {
      containerVariable: containerName,
      containedVariables,
    } of model.compartments) {
      for (const name of containedVariables) {
        const container = this.variables.get(containerName);
        if (!container) {
          throw new CompileModelError(
            `Compartment must be associated with a variable, but no variable with name ${containerName} found.`,
          );
        }
        this.compartments.set(name, container);
      }
    }

    this.yTable = new IndexSymbolTable();
    for (const name of this.yVars) {
      this.yTable.add(name);
    }

    this.pTable = new IndexSymbolTable();
    for (const name of this.pVars) {
      this.pTable.add(name);
    }
    for (const reaction of model.reactions) {
      this.pTable.add(reaction.name);
    }
    // we actually add the yVars to pTable to represent the ydot
    for (const name of this.yVars) {
      this.pTable.add(name);
    }

    this.assignmentGraph = createAssignmentsGraphFromCompilation(this);
  }

  addPiecewisePiece(
    branch: IridiumExpression,
    condition: IridiumExpression,
  ): number {
    if (this.piecewisePieces.has(branch)) {
      throw new CompileInvariantError("Duplicate piecewise index.");
    }

    const index = this.piecewisePieces.size;
    this.piecewisePieces.set(branch, { index, condition });
    return index;
  }

  getPiecewisePieceIndex(branch: IridiumExpression): number {
    const piece = this.piecewisePieces.get(branch);
    if (piece === undefined) {
      throw new CompileInvariantError("Missing piecewise index?");
    }

    return piece.index;
  }

  forAllExpressions(
    callback: (
      expr: IridiumExpression,
      context: "variables" | "events" | "reactions" | "functions",
    ) => void,
  ): void {
    for (const variable of this.variables.values()) {
      if (
        variable.value.kind === "initial" ||
        variable.value.kind === "reaction"
      ) {
        callback(variable.value.initial, "variables");
      } else if (variable.value.kind === "rate") {
        callback(variable.value.initial, "variables");
        callback(variable.value.rate, "variables");
      } else if (variable.value.kind === "assignment") {
        callback(variable.value.assignment, "variables");
      }
    }

    for (const event of this.events.values()) {
      callback(event.trigger, "events");

      if (event.delay) {
        callback(event.delay, "events");
      }

      if (event.priority) {
        callback(event.priority, "events");
      }

      for (const assignment of event.assignments) {
        callback(assignment.value, "events");
      }
    }

    for (const reaction of this.reactions.values()) {
      callback(reaction.rate, "reactions");
    }

    for (const func of this.functions.values()) {
      callback(func.body, "functions");
    }
  }
}

export const createAssignmentsGraphFromCompilation = (
  { yTable, pTable, variables, reactions, compartments }: Compilation,
  isForInitialValues?: boolean,
): AssignmentGraph => {
  const yAssignments = new Map<string, IridiumExpression>();
  const ydotAssignments = new Map<string, IridiumExpression>();
  const pAssignments = new Map<string, IridiumExpression>();

  // collect stoichiometry matrix

  const involvedReactions: Map<
    string,
    Map<string, IridiumExpression>
  > = new Map();

  const mergeMapWithAdd = (
    map: Map<string, IridiumExpression>,
    name: string,
    expr: IridiumExpression,
  ) => {
    if (map.has(name)) {
      map.set(name, {
        kind: "binary",
        op: "add",
        left: map.get(name)!,
        right: expr,
      });
    } else {
      map.set(name, expr);
    }
  };

  for (const reaction of reactions.values()) {
    for (const reactant of reaction.reactants) {
      const reactantMap = involvedReactions.get(reactant.name);
      const stoichExpr: IridiumExpression = {
        kind: "unary",
        op: "neg",
        expr: reactant.stoichiometry,
      };
      if (reactantMap) {
        mergeMapWithAdd(reactantMap, reaction.name, stoichExpr);
      } else {
        involvedReactions.set(
          reactant.name,
          new Map([[reaction.name, stoichExpr]]),
        );
      }
    }

    for (const product of reaction.products) {
      const productMap = involvedReactions.get(product.name);
      if (productMap) {
        mergeMapWithAdd(productMap, reaction.name, product.stoichiometry);
      } else {
        involvedReactions.set(
          product.name,
          new Map([[reaction.name, product.stoichiometry]]),
        );
      }
    }
  }

  // state assignments

  for (const reaction of reactions.values()) {
    pAssignments.set(reaction.name, reaction.rate);
  }

  const addInitialValue = (
    assignmentTable: Map<string, IridiumExpression>,
    variable: IridiumVariable,
  ): void => {
    const compartment = compartments.get(variable.name);
    if (isForInitialValues && "initial" in variable.value) {
      if (!isForInitialValues && !variable.hasSubstanceOnly && compartment) {
        assignmentTable.set(
          variable.name,
          expr.mul(variable.value.initial, expr.var(compartment.name)),
        );
      } else {
        assignmentTable.set(variable.name, variable.value.initial);
      }
    }
  };

  for (const variable of variables.values()) {
    switch (variable.value.kind) {
      case "initial":
        addInitialValue(pAssignments, variable);
        break;
      case "rate": {
        addInitialValue(yAssignments, variable);

        const compartment = compartments.get(variable.name);
        let assignment = variable.value.rate;
        if (!isForInitialValues && !variable.hasSubstanceOnly && compartment) {
          assignment = expr.mul(assignment, expr.var(compartment.name));
          // NOTE: We are failing to account for the scenario where the COMPARTMENT has an assignment rule since that would
          //       require differentiating the volume which is not fun.
          if (
            compartment.value.kind === "rate" ||
            compartment.value.kind === "reaction"
          ) {
            // do product rule: d/dt (x * y) = x * dy/dt + y * dx/dt
            assignment = expr.add(
              assignment,
              expr.mul(expr.rateOf(compartment.name), expr.var(variable.name)),
            );
          }
        }
        ydotAssignments.set(variable.name, assignment);
        break;
      }
      case "assignment": {
        const compartment = compartments.get(variable.name);
        if (!isForInitialValues && !variable.hasSubstanceOnly && compartment) {
          pAssignments.set(
            variable.name,
            expr.mul(variable.value.assignment, expr.var(compartment.name)),
          );
        } else {
          pAssignments.set(variable.name, variable.value.assignment);
        }
        break;
      }
      case "reaction": {
        addInitialValue(yAssignments, variable);

        const reactions = involvedReactions.get(variable.name);

        if (reactions) {
          const terms: IridiumExpression[] = [];
          for (const [reaction, stoichExpr] of reactions) {
            const constStoich = tryEvaluateStoichiometry(stoichExpr);
            if (constStoich === 0) continue;

            if (constStoich === null) {
              // can't be evaluated at compile-time, manually evaluate at runtime
              terms.push(expr.mul(expr.var(reaction), stoichExpr));
            } else if (constStoich === -1) {
              terms.push(expr.neg(expr.var(reaction)));
            } else if (constStoich !== 1) {
              terms.push(expr.mul(expr.var(reaction), expr.num(constStoich)));
            } else {
              terms.push(expr.var(reaction));
            }
          }

          ydotAssignments.set(
            variable.name,
            terms.reduce<IridiumExpression | undefined>(
              (acc, current) => (acc ? expr.add(current, acc) : current),
              undefined,
            ) ?? expr.num(0),
          );
        } else {
          ydotAssignments.set(variable.name, expr.num(0));
        }

        break;
      }
    }
  }

  return new AssignmentGraph(
    yTable,
    pTable,
    yAssignments,
    ydotAssignments,
    pAssignments,
  );
};
