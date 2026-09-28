import { walkExpression, type IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import type { IridiumReactionTerm } from "../../ir/model";
import { getBool, getNumber, getString, type UnknownAttrs } from "../attrs";
import type { Builder } from "../builder";
import { SbmlCompileInternalError } from "../errors";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext } from "./math";

export class ReactionContext extends Context {
  #inside:
    | "kineticLaw"
    | "listOfReactants"
    | "listOfProducts"
    | "listOfLocalParameters"
    | "listOfModifierSpeciesReferences"
    | undefined;

  #builder: Builder;
  #id: string;
  #kineticLaw: IridiumExpression | undefined;
  #reactants: IridiumReactionTerm[];
  #products: IridiumReactionTerm[];
  #localParameters: Map<string, string>;

  constructor(builder: Builder, id: string) {
    super();
    this.#builder = builder;
    this.#inside = undefined;

    this.#id = id;
    this.#reactants = [];
    this.#products = [];
    this.#localParameters = new Map();
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    if (this.#inside === "listOfLocalParameters") {
      if (name === "localParameter") {
        const id = getString(attrs, "id");
        const value = getNumber(attrs, "value", 0);
        if (this.#localParameters.has(id)) {
          throw new SbmlCompileInternalError(
            "Duplicate local parameter id: " + id,
          );
        } else if (
          this.#products.find((t) => t.name === id) ||
          this.#reactants.find((t) => t.name === id)
        ) {
          throw new SbmlCompileInternalError(
            "Local parameter with same id as species: " + id,
          );
        }

        const mappedId = this.#builder.getUniqueLocalParameterId(this.#id, id);
        this.#localParameters.set(id, mappedId);
        this.#builder.ir.variables.push({
          name: mappedId,
          hasSubstanceOnly: false,
          value: { kind: "initial", initial: expr.num(value) },
        });
      } else {
        // throw new SbmlCompileInternalError("Unexpected element.");
      }
    } else if (this.#inside === "kineticLaw") {
      if (name === "math") {
        return pushContext(new MathContext());
      } else if (name === "listOfLocalParameters") {
        this.#inside = "listOfLocalParameters";
      } else {
        // throw new SbmlCompileInternalError("Unexpected element.");
      }
    } else if (this.#inside === "listOfModifierSpeciesReferences") {
      // ignore everything we don't use this
    } else {
      if (name === "kineticLaw") {
        this.#inside = "kineticLaw";
      } else if (name === "listOfProducts") {
        this.#inside = "listOfProducts";
      } else if (name === "listOfReactants") {
        this.#inside = "listOfReactants";
      } else if (name === "speciesReference") {
        const id = "id" in attrs ? this.#builder.getId(attrs) : undefined;
        const species = this.#builder.getRef(attrs, "species");
        const speciesVar = this.#builder.species.get(species);
        if (!speciesVar) {
          throw new SbmlCompileInternalError(
            "speciesReference must refer to a species.",
          );
        } else if (speciesVar.value.kind === "initial") {
          speciesVar.value = { ...speciesVar.value, kind: "reaction" };
        }

        const stoichiometry = getNumber(attrs, "stoichiometry", 1);

        let reactionTerm: IridiumReactionTerm;
        if (id !== undefined) {
          const isConstant = getBool(attrs, "constant");

          if (isConstant) this.#builder.constants.add(id);

          this.#builder.addSpeciesReference({
            name: id,
            hasSubstanceOnly: false,
            value: { kind: "initial", initial: expr.num(stoichiometry) },
          });

          reactionTerm = {
            name: species,
            stoichiometry: expr.var(id),
          };
        } else {
          reactionTerm = {
            name: species,
            stoichiometry: expr.num(stoichiometry),
          };
        }

        if (this.#localParameters.has(reactionTerm.name)) {
          throw new SbmlCompileInternalError(
            "speciesReference with same id as local parameter: " +
              reactionTerm.name,
          );
        }

        if (this.#inside === "listOfReactants") {
          this.#reactants.push(reactionTerm);
        } else if (this.#inside === "listOfProducts") {
          this.#products.push(reactionTerm);
        } else {
          throw new SbmlCompileInternalError("Unexpected <speciesReference>.");
        }
      }
    }

    return;
  }

  onPop(context: Context, result?: unknown): void {
    if (this.#inside === "kineticLaw" && context instanceof MathContext) {
      this.#kineticLaw = result as IridiumExpression;
    }
  }

  onEndElement(name: string): ContextResult | undefined {
    switch (name) {
      case "kineticLaw":
      case "listOfProducts":
      case "listOfReactants":
      case "listOfModifierSpeciesReferences":
        this.#inside = undefined;
        break;

      case "listOfLocalParameters":
        this.#inside = "kineticLaw";
        break;

      case "reaction": {
        // re-map local parameter names
        if (this.#localParameters.size > 0 && this.#kineticLaw) {
          walkExpression(this.#kineticLaw, {
            beforeVariable: (expr) => {
              const newName = this.#localParameters.get(expr.name);
              if (newName) {
                expr.name = newName;
              }
            },
          });
        }

        this.#builder.ir.reactions.push({
          name: this.#id,
          products: this.#products,
          reactants: this.#reactants,
          rate: this.#kineticLaw ?? expr.num(0),
        });

        return popContext();
      }
    }

    return;
  }
}
