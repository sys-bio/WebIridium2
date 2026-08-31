export type IridiumExpressionNumber<Metadata = unknown> = {
  kind: "number";
  value: number;
  metadata?: Metadata;
};
export type IridiumExpressionVariable<Metadata = unknown> = {
  kind: "variable";
  name: string;
  metadata?: Metadata;
};
export type IridiumExpressionRateOf<Metadata = unknown> = {
  kind: "rateOf";
  name: string;
  metadata?: Metadata;
};
export type IridiumBinaryOperator =
  | "add"
  | "sub"
  | "mul"
  | "div"
  | "mod"
  | "pow"
  | "and"
  | "or"
  | "eq"
  | "neq"
  | "ge"
  | "gt"
  | "le"
  | "lt";
export type IridiumExpressionBinary<Metadata = unknown> = {
  kind: "binary";
  op: IridiumBinaryOperator;
  left: IridiumExpression<Metadata>;
  right: IridiumExpression<Metadata>;
  metadata?: Metadata;
};
export type IridiumUnaryOperator = "neg" | "not";
export type IridiumExpressionUnary<Metadata = unknown> = {
  kind: "unary";
  op: IridiumUnaryOperator;
  expr: IridiumExpression<Metadata>;
  metadata?: Metadata;
};
export type IridiumExpressionCall<Metadata = unknown> = {
  kind: "call";
  name: string;
  args: IridiumExpression<Metadata>[];
  metadata?: Metadata;
};

export type IridiumExpression<Metadata = unknown> =
  | IridiumExpressionNumber<Metadata>
  | IridiumExpressionVariable<Metadata>
  | IridiumExpressionRateOf<Metadata>
  | IridiumExpressionBinary<Metadata>
  | IridiumExpressionUnary<Metadata>
  | IridiumExpressionCall<Metadata>;

export type IridiumExpressionListener<Metadata = unknown> = {
  beforeNumber?: (number: IridiumExpressionNumber<Metadata>) => void;
  afterNumber?: (number: IridiumExpressionNumber<Metadata>) => void;

  beforeVariable?: (variable: IridiumExpressionVariable<Metadata>) => void;
  afterVariable?: (variable: IridiumExpressionVariable<Metadata>) => void;

  beforeRateOf?: (rateOf: IridiumExpressionRateOf<Metadata>) => void;
  afterRateOf?: (rateOf: IridiumExpressionRateOf<Metadata>) => void;

  beforeBinary?: (binary: IridiumExpressionBinary<Metadata>) => void;
  afterBinary?: (binary: IridiumExpressionBinary<Metadata>) => void;

  beforeUnary?: (unary: IridiumExpressionUnary<Metadata>) => void;
  afterUnary?: (unary: IridiumExpressionUnary<Metadata>) => void;

  beforeCall?: (call: IridiumExpressionCall<Metadata>) => void;
  afterCall?: (call: IridiumExpressionCall<Metadata>) => void;
};

export const walkExpression = <T>(
  expr: IridiumExpression<T>,
  listener: IridiumExpressionListener<T>,
): void => {
  if (expr.kind === "number") {
    listener?.beforeNumber?.(expr);
    listener?.afterNumber?.(expr);
  } else if (expr.kind === "variable") {
    listener?.beforeVariable?.(expr);
    listener?.afterVariable?.(expr);
  } else if (expr.kind === "rateOf") {
    listener?.beforeRateOf?.(expr);
    listener?.afterRateOf?.(expr);
  } else if (expr.kind === "binary") {
    listener?.beforeBinary?.(expr);
    walkExpression(expr.left, listener);
    walkExpression(expr.right, listener);
    listener?.afterBinary?.(expr);
  } else if (expr.kind === "unary") {
    listener?.beforeUnary?.(expr);
    walkExpression(expr.expr, listener);
    listener?.afterUnary?.(expr);
  } else if (expr.kind === "call") {
    listener?.beforeCall?.(expr);
    for (const arg of expr.args) {
      walkExpression(arg, listener);
    }
    listener?.afterCall?.(expr);
  }
};

export type IridiumExpressionVisitor<T, Metadata = unknown> = {
  visitNumber?: (number: IridiumExpressionNumber<Metadata>) => T;
  visitVariable?: (variable: IridiumExpressionVariable<Metadata>) => T;
  visitRateOf?: (rateOf: IridiumExpressionRateOf<Metadata>) => T;
  visitBinary?: (binary: IridiumExpressionBinary<Metadata>) => T;
  visitUnary?: (unary: IridiumExpressionUnary<Metadata>) => T;
  visitCall?: (call: IridiumExpressionCall<Metadata>) => T;
};

export const visitExpression = <T, Metadata = unknown>(
  expr: IridiumExpression<Metadata>,
  visitor: IridiumExpressionVisitor<T, Metadata>,
): T => {
  if (expr.kind === "number") {
    if (!visitor.visitNumber) throw new Error("Missing visitNumber");
    return visitor.visitNumber(expr);
  } else if (expr.kind === "variable") {
    if (!visitor.visitVariable) throw new Error("Missing visitVariable");
    return visitor.visitVariable(expr);
  } else if (expr.kind === "rateOf") {
    if (!visitor.visitRateOf) throw new Error("Missing visitRateOf");
    return visitor.visitRateOf(expr);
  } else if (expr.kind === "binary") {
    if (!visitor.visitBinary) throw new Error("Missing visitBinary");
    return visitor.visitBinary(expr);
  } else if (expr.kind === "unary") {
    if (!visitor.visitUnary) throw new Error("Missing visitUnary");
    return visitor.visitUnary(expr);
  } else if (expr.kind === "call") {
    if (!visitor.visitCall) throw new Error("Missing visitCall");
    return visitor.visitCall(expr);
  } else {
    throw new Error("Unknown expression kind");
  }
};

export const prettyIridiumExpressionToString = (
  expr: IridiumExpression,
): string => {
  switch (expr.kind) {
    case "number":
      return expr.value.toString();
    case "variable":
      return expr.name;
    case "rateOf":
      return expr.name + "'";
    case "unary":
      return (
        "(" + expr.op + " " + prettyIridiumExpressionToString(expr.expr) + ")"
      );
    case "binary":
      return (
        "(" +
        expr.op +
        " " +
        prettyIridiumExpressionToString(expr.left) +
        " " +
        prettyIridiumExpressionToString(expr.right) +
        ")"
      );
    case "call":
      return (
        "(" +
        expr.name +
        " " +
        expr.args.map(prettyIridiumExpressionToString).join(" ") +
        ")"
      );
  }
};
