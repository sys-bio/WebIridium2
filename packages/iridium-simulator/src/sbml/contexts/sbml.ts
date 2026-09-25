import type { IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import type { Builder, UnknownAttrs } from "../builder";
import { Context, pushContext, type ContextResult } from "./base";
import { ReactionContext } from "./reaction";

export class SbmlContext extends Context {
  constructor(builder: Builder) {
    super(builder);
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    switch (name) {
      case "compartment": {
        const id = this.builder.getId(attrs);
        // default to 1 for convenience
        const size =
          "size" in attrs ? this.builder.getNumber(attrs, "size") : 1;
        const isConstant = this.builder.getBool(attrs, "constant");

        if (isConstant) {
          this.builder.constants.add(id);
        }

        this.builder.createCompartmentList(id);
        this.builder.addVariable({
          name: id,
          hasSubstanceOnly: false,
          value: { kind: "initial", initial: expr.num(size) },
        });

        break;
      }
      case "species": {
        const id = this.builder.getId(attrs);
        const compartment = this.builder.getCompartment(attrs);
        const hasSubstanceOnly = this.builder.getBool(
          attrs,
          "hasOnlySubstanceUnits",
        );
        const isBoundaryCondition = this.builder.getBool(
          attrs,
          "boundaryCondition",
        );
        const isConstant = this.builder.getBool(attrs, "constant");

        if (isConstant) this.builder.constants.add(id);
        if (isBoundaryCondition) this.builder.boundaryConditions.add(id);

        let initial: IridiumExpression;
        if ("initialAmount" in attrs) {
          const initialAmount = this.builder.getNumber(attrs, "initialAmount");
          if (hasSubstanceOnly) {
            initial = expr.num(initialAmount);
          } else {
            initial = expr.div(expr.num(initialAmount), expr.var(compartment));
          }
        } else if ("initialConcentration" in attrs) {
          const initialConcentration = this.builder.getNumber(
            attrs,
            "initialConcentration",
          );
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

        this.builder.addToCompartmentList(compartment, id);
        this.builder.addSpecies({
          name: id,
          hasSubstanceOnly,
          value: {
            kind: isBoundaryCondition || isConstant ? "initial" : "reaction",
            initial,
          },
        });

        break;
      }
      case "parameter": {
        const id = this.builder.getId(attrs);
        const value =
          "value" in attrs ? this.builder.getNumber(attrs, "value") : 0;
        const isConstant = this.builder.getBool(attrs, "constant");

        if (isConstant) this.builder.constants.add(id);

        this.builder.addVariable({
          name: id,
          hasSubstanceOnly: false,
          value: { kind: "initial", initial: expr.num(value) },
        });

        break;
      }
      case "reaction": {
        const id = this.builder.getId(attrs);
        return pushContext(new ReactionContext(this.builder, id));
      }
      default:
        return;
    }
  }
}
