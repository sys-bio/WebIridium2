import type { Compilation } from "./Compilation";
import { CompileError, CompileInvariantError } from "./errors";
import type { FunctionTable, LocalsSymbolTable } from "./symbolTables";
import {
  EVENTS_PARAM,
  P_PARAM,
  T_PARAM,
  TIME_NAME,
  Y_PARAM,
  YDOT_PARAM,
} from "../names";
import type Emitter from "./Emitter";
import { OpCode } from "./codes";
import { builtinConstants } from "../runtime/builtins.ts";
import { MEM_ALIGNMENT, SIZEOF_DOUBLE } from "./constants";
import type {
  IridiumExpressionRateOf,
  IridiumExpressionVariable,
} from "../ir/ast";

export interface Scope {
  emitLoadVariable(emitter: Emitter, expr: IridiumExpressionVariable): void;
  emitLoadRate(emitter: Emitter, expr: IridiumExpressionRateOf): void;
  emitCallOp(emitter: Emitter, name: string): void;
}

export class GlobalScope implements Scope {
  #compilation: Compilation;
  localsTable: LocalsSymbolTable;
  functionTable: FunctionTable;

  /**
   * localsTable should have T_PARAM, Y_PARAM, P_PARAM, EVENTS_PARAM.
   */
  constructor(
    compilation: Compilation,
    localsTable: LocalsSymbolTable,
    functionTable: FunctionTable,
  ) {
    if (!localsTable.hasParam(T_PARAM))
      throw new CompileInvariantError("Missing T_PARAM.");
    if (!localsTable.hasParam(Y_PARAM))
      throw new CompileInvariantError("Missing Y_PARAM.");
    if (!localsTable.hasParam(P_PARAM))
      throw new CompileInvariantError("Missing P_PARAM.");
    if (!localsTable.hasParam(EVENTS_PARAM))
      throw new CompileInvariantError("Missing EVENTS_PARAM.");

    this.#compilation = compilation;
    this.localsTable = localsTable;
    this.functionTable = functionTable;
  }

  /**
   * Ensure the given name is actually a valid name.
   */
  #emitLoadVariableUnsafe(emitter: Emitter, name: string): void {
    if (this.#compilation.yTable.has(name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(Y_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * this.#compilation.yTable.get(name));
    } else {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(P_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * this.#compilation.pTable.get(name));
    }
  }

  /**
   * @returns if the name was found
   */
  emitLoadVariableFromName(emitter: Emitter, name: string): boolean {
    if (name === TIME_NAME) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(T_PARAM));
      return true;
    } else if (Object.hasOwn(builtinConstants, name)) {
      emitter.emitByte(OpCode.f64const);
      emitter.emitFloat64(builtinConstants[name].value);
      return true;
    } else if (
      this.#compilation.yTable.has(name) ||
      this.#compilation.pTable.has(name)
    ) {
      this.#emitLoadVariableUnsafe(emitter, name);

      const variable = this.#compilation.variables.get(name);
      const compartment = this.#compilation.compartments.get(name);
      if (!variable?.hasSubstanceOnly && compartment) {
        this.emitConvertToConcentration(emitter, compartment.name);
      }
      return true;
    } else {
      return false;
    }
  }

  emitLoadVariable(emitter: Emitter, expr: IridiumExpressionVariable): void {
    if (!this.emitLoadVariableFromName(emitter, expr.name)) {
      throw new CompileError(`Unbound name: ${expr.name}`, expr.metadata);
    }
  }

  /**
   * Ensure the given name has been evaluated and it has a rate or
   * weird stuff will happen.
   */
  #emitLoadRateUnsafe(emitter: Emitter, name: string): void {
    // In the RHS, the rateOf will be stored in the ydot param.
    // In updateP, the rateOf will be stored in the p param.
    if (this.localsTable.hasParam(YDOT_PARAM)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(YDOT_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * this.#compilation.yTable.get(name));
    } else {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.localsTable.getParam(P_PARAM));

      emitter.emitByte(OpCode.f64load);
      emitter.emitUint(MEM_ALIGNMENT);
      emitter.emitUint(SIZEOF_DOUBLE * this.#compilation.pTable.get(name));
    }
  }

  emitLoadRateFromName(emitter: Emitter, name: string): boolean {
    if (name === TIME_NAME) {
      // TODO: no idea if this is right
      emitter.emitF64ConstOp(1);
      return true;
    } else if (Object.hasOwn(builtinConstants, name)) {
      // TODO: does the spec allow this
      emitter.emitF64ConstOp(0);
      return true;
    } else {
      const variable = this.#compilation.variables.get(name);
      if (!variable) return false;

      switch (variable.value.kind) {
        case "assignment":
        case "algebraic":
          // Can't get the rate of these.
          return false;
        case "initial":
          emitter.emitF64ConstOp(0);
          return true;
        case "reaction":
        case "rate": {
          this.#emitLoadRateUnsafe(emitter, variable.name);

          const compartment = this.#compilation.compartments.get(name);
          if (variable && !variable.hasSubstanceOnly && compartment) {
            this.emitConvertToConcentration(emitter, compartment.name);

            // a = amount, c = concentration, C = compartment (in amount)
            // c = a/C so dc/dt = (C * da/dt - a * dCA/dt) / C^2
            // simplfies to dc/dt = da/dt / C - c * dCA/dt / C
            // since we already have the left term, we just need to complete the right term
            if (
              compartment.value.kind === "rate" ||
              compartment.value.kind === "reaction"
            ) {
              if (!this.emitLoadVariableFromName(emitter, variable.name))
                return false;

              this.#emitLoadRateUnsafe(emitter, compartment.name);
              emitter.emitByte(OpCode.f64mul);

              this.#emitLoadVariableUnsafe(emitter, compartment.name);
              emitter.emitByte(OpCode.f64div);

              emitter.emitByte(OpCode.f64sub);
            }
          }

          return true;
        }
      }
    }
  }

  emitLoadRate(emitter: Emitter, expr: IridiumExpressionRateOf): void {
    if (!this.emitLoadRateFromName(emitter, expr.name)) {
      throw new CompileError(
        `Cannot determine rateOf: ${expr.name}`,
        expr.metadata,
      );
    }
  }

  emitCallOp(emitter: Emitter, name: string): void {
    emitter.emitCallOp(this.functionTable.get(name));
  }

  emitConvertToConcentration(emitter: Emitter, compartment: string): void {
    this.emitLoadVariableFromName(emitter, compartment);
    emitter.emitByte(OpCode.f64div);
  }

  emitConvertToAmount(emitter: Emitter, compartment: string): void {
    this.emitLoadVariableFromName(emitter, compartment);
    emitter.emitByte(OpCode.f64mul);
  }
}

export class FunctionScope implements Scope {
  #localsTable: LocalsSymbolTable;
  #functionTable: FunctionTable;

  constructor(localsTable: LocalsSymbolTable, functionTable: FunctionTable) {
    this.#localsTable = localsTable;
    this.#functionTable = functionTable;
  }

  emitLoadVariable(emitter: Emitter, expr: IridiumExpressionVariable): void {
    if (this.#localsTable.hasParam(expr.name)) {
      emitter.emitByte(OpCode.localget);
      emitter.emitUint(this.#localsTable.getParam(expr.name));
    } else {
      throw new CompileError(`Unbound name: ${expr.name}.`, expr.metadata);
    }
  }

  emitLoadRate(_emitter: Emitter, expr: IridiumExpressionRateOf): void {
    throw new CompileError("rateOf not allowed function body.", expr);
  }

  emitCallOp(emitter: Emitter, name: string): void {
    emitter.emitCallOp(this.#functionTable.get(name));
  }
}
