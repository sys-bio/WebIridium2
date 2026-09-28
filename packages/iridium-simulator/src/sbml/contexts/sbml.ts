import type { IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import type { IridiumVariableValue } from "../../ir/model";
import type { Builder } from "../builder";
import { Context, pushContext, type ContextResult } from "./base";
import { ReactionContext } from "./reaction";
import { AssignmentContext } from "./assignment";
import { AlgebraicContext } from "./algebraic";
import { getBool, getNumber, getString, type UnknownAttrs } from "../attrs";

export class SbmlContext extends Context {
  #builder: Builder;

  constructor(builder: Builder) {
    super();
    this.#builder = builder;
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    switch (name) {
      case "compartment": {
        const id = this.#builder.getId(attrs);
        // default to 1 for convenience
        const size = "size" in attrs ? getNumber(attrs, "size") : 1;
        const isConstant = getBool(attrs, "constant");

        if (isConstant) {
          this.#builder.constants.add(id);
        }

        this.#builder.addCompartment({
          name: id,
          hasSubstanceOnly: false,
          value: { kind: "initial", initial: expr.num(size) },
        });

        break;
      }
      case "parameter": {
        const id = this.#builder.getId(attrs);
        const value = "value" in attrs ? getNumber(attrs, "value") : 0;
        const isConstant = getBool(attrs, "constant");

        if (isConstant) this.#builder.constants.add(id);

        this.#builder.addParameter({
          name: id,
          hasSubstanceOnly: false,
          value: { kind: "initial", initial: expr.num(value) },
        });

        break;
      }
      case "species": {
        const id = this.#builder.getId(attrs);
        const compartment = this.#builder.getCompartment(attrs);
        const hasSubstanceOnly = getBool(attrs, "hasOnlySubstanceUnits");
        const isBoundaryCondition = getBool(attrs, "boundaryCondition");
        const isConstant = getBool(attrs, "constant");
        // TODO: check the conversion factor is a parameter and that it is constant?
        const conversionFactor =
          "conversionFactor" in attrs
            ? getString(attrs, "conversionFactor")
            : undefined;
        // TODO: add this in a validation pass ? (or just ignore it I guess)
        // if (conversionFactor !== undefined && (!this.#builder.parameters.has(conversionFactor) || !this.#builder.constants.has(conversionFactor))) {
        //   throw new SbmlCompileInternalError("Bad conversionFactor");
        // }

        if (isConstant) this.#builder.constants.add(id);
        if (isBoundaryCondition) this.#builder.boundaryConditions.add(id);

        let initial: IridiumExpression;
        if ("initialAmount" in attrs) {
          const initialAmount = getNumber(attrs, "initialAmount");
          if (hasSubstanceOnly) {
            initial = expr.num(initialAmount);
          } else {
            initial = expr.div(expr.num(initialAmount), expr.var(compartment));
          }
        } else if ("initialConcentration" in attrs) {
          const initialConcentration = getNumber(attrs, "initialConcentration");
          if (hasSubstanceOnly) {
            initial = expr.mul(
              expr.num(initialConcentration),
              expr.var(compartment),
            );
          } else {
            initial = expr.num(initialConcentration);
          }
        } else {
          initial = expr.num(0);
        }

        let value: IridiumVariableValue;
        if (conversionFactor === undefined) {
          value = { kind: "initial", initial };
        } else {
          value = {
            kind: "reaction",
            initial,
            conversionFactor:
              conversionFactor !== undefined
                ? expr.var(conversionFactor)
                : undefined,
          };
        }

        this.#builder.addToCompartmentList(compartment, id);
        this.#builder.addSpecies({
          name: id,
          hasSubstanceOnly,
          value,
        });

        break;
      }
      case "initialAssignment": {
        if ("id" in attrs) {
          this.#builder.getId(attrs);
        }

        const symbol = this.#builder.getRef(attrs, "symbol");
        return pushContext(
          new AssignmentContext(this.#builder, "initial", symbol),
        );
      }
      case "assignmentRule": {
        if ("id" in attrs) {
          this.#builder.getId(attrs);
        }

        const variable = this.#builder.getRef(attrs, "variable");
        return pushContext(
          new AssignmentContext(this.#builder, "assignment", variable),
        );
      }
      case "rateRule": {
        if ("id" in attrs) {
          this.#builder.getId(attrs);
        }

        const variable = this.#builder.getRef(attrs, "variable");
        return pushContext(
          new AssignmentContext(this.#builder, "rate", variable),
        );
      }
      case "algebraicRule": {
        let id: string | undefined;
        if ("id" in attrs) {
          id = this.#builder.getId(attrs);
        }

        return pushContext(new AlgebraicContext(this.#builder, id));
      }
      case "reaction": {
        const id = this.#builder.getId(attrs);
        return pushContext(new ReactionContext(this.#builder, id));
      }
      default:
        return;
    }
  }
}
