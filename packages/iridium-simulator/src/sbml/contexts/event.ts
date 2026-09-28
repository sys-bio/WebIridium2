import type { IridiumExpression } from "../../ir/ast";
import type { IridiumEventAssignment } from "../../ir/model";
import { getBool, getString, type UnknownAttrs } from "../attrs";
import type { Builder } from "../builder";
import { Context, popContext, pushContext, type ContextResult } from "./base";
import { MathContext } from "./math";

const TRIGGER = 0;
const DELAY = 1;
const PRIORITY = 2;
const ASSIGNMENT = 3;

export class EventContext extends Context {
  #builder: Builder;
  #inside:
    | typeof TRIGGER
    | typeof DELAY
    | typeof PRIORITY
    | typeof ASSIGNMENT
    | undefined;
  #insideUsedMath: boolean;
  #assignmentName?: string;

  #id: string | undefined;
  #trigger?: IridiumExpression;
  #delay?: IridiumExpression;
  #priority?: IridiumExpression;
  #assignments: IridiumEventAssignment[];
  #isT0: boolean;
  #isPersistent: boolean;
  #isFromTrigger: boolean;

  constructor(
    builder: Builder,
    id: string | undefined,
    isFromTrigger: boolean,
  ) {
    super();
    this.#builder = builder;
    this.#insideUsedMath = false;
    this.#assignments = [];

    this.#id = id;
    this.#isT0 = false;
    this.#isPersistent = false;
    this.#isFromTrigger = isFromTrigger;
  }

  onStartElement(name: string, attrs: UnknownAttrs): ContextResult | undefined {
    if (this.#inside !== undefined) {
      if (name === "math") {
        return pushContext(new MathContext());
      }
    } else {
      switch (name) {
        case "trigger":
          this.#inside = TRIGGER;
          this.#insideUsedMath = false;

          this.#isT0 = getBool(attrs, "initialValue");
          this.#isPersistent = getBool(attrs, "persistent");
          break;
        case "delay":
          this.#inside = DELAY;
          this.#insideUsedMath = false;
          break;
        case "priority":
          this.#inside = PRIORITY;
          this.#insideUsedMath = false;
          break;
        case "eventAssignment": {
          const variable = getString(attrs, "variable");
          if (this.#builder.getVariable(variable)) {
            this.#inside = ASSIGNMENT;
            this.#insideUsedMath = false;
            this.#assignmentName = variable;
          }
          break;
        }
      }
    }
  }

  onPop(_context: Context, result?: unknown): void {
    if (this.#inside === undefined || this.#insideUsedMath) return;

    this.#insideUsedMath = true;

    switch (this.#inside) {
      case TRIGGER:
        this.#trigger = result as IridiumExpression;
        break;
      case DELAY:
        this.#delay = result as IridiumExpression;
        break;
      case PRIORITY:
        this.#priority = result as IridiumExpression;
        break;
      case ASSIGNMENT:
        if (this.#assignmentName !== undefined) {
          this.#assignments.push({
            name: this.#assignmentName,
            value: result as IridiumExpression,
          });
          this.#assignmentName = undefined;
        }
        break;
    }
  }

  onEndElement(name: string): ContextResult | undefined {
    switch (name) {
      case "event":
        if (this.#trigger && this.#assignments.length > 0) {
          this.#builder.addEvent({
            name: this.#id ?? this.#builder.getUniqueEventId(),
            trigger: this.#trigger,
            delay: this.#delay,
            priority: this.#priority,
            assignments: this.#assignments,
            isT0: this.#isT0,
            isFromTrigger: this.#isFromTrigger,
            isPersistent: this.#isPersistent,
          });
        }

        return popContext();
      case "trigger":
        this.#inside = undefined;
        break;
      case "delay":
        this.#inside = undefined;
        break;
      case "priority":
        this.#inside = undefined;
        break;
      case "eventAssignment":
        this.#inside = undefined;
        break;
    }
  }
}
