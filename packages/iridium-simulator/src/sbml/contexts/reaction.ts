import type { IridiumExpression } from "../../ir/ast";
import { expr } from "../../ir/dsl";
import type { IridiumReactionTerm } from "../../ir/model";
import type { Builder, UnknownAttrs } from "../builder";
import { SbmlCompileInternalError } from "../errors";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext } from "./math";

export class ReactionContext extends Context {
  #inside: "kineticLaw" | "listOfReactants" | "listOfProducts" | undefined;

  #id: string;
  #kineticLaw: IridiumExpression | undefined;
  #reactants: IridiumReactionTerm[];
  #products: IridiumReactionTerm[];

  constructor(builder: Builder, id: string) {
    super(builder);
    this.#inside = undefined;

    this.#id = id;
    this.#reactants = [];
    this.#products = [];
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    if (this.#inside === "kineticLaw") {
      if (name === "math") {
        return pushContext(new MathContext(this.builder));
      } else if (name === "localParameter") {
        // TODO: implement
      }
    } else {
      if (name === "kineticLaw") {
        this.#inside = "kineticLaw";
      } else if (name === "listOfProducts") {
        this.#inside = "listOfProducts";
      } else if (name === "listOfReactants") {
        this.#inside = "listOfReactants";
      } else if (name === "speciesReference") {
        const id = "id" in attrs ? this.builder.getId(attrs) : undefined;
        const species = this.builder.getRef(attrs, "species");
        if (!this.builder.species.has(species))
          throw new SbmlCompileInternalError(
            "speciesReference must refer to a species.",
          );
        const stoichiometry =
          "stoichiometry" in attrs
            ? this.builder.getNumber(attrs, "stoichiometry")
            : 1;

        let reactionTerm: IridiumReactionTerm;
        if (id !== undefined) {
          const isConstant = this.builder.getBool(attrs, "constant");

          if (isConstant) this.builder.constants.add(id);

          this.builder.addVariable({
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

        if (this.#inside === "listOfReactants") {
          this.#reactants.push(reactionTerm);
        } else if (this.#inside === "listOfProducts") {
          this.#products.push(reactionTerm);
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
        this.#inside = undefined;
        break;

      case "reaction": {
        this.builder.ir.reactions.push({
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
