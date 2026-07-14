export type IridiumExpression<Metadata = unknown> =
  | { kind: "number"; value: number; metadata?: Metadata }
  | { kind: "variable"; name: string; metadata?: Metadata }
  | {
      kind: "binary";
      op: string;
      left: IridiumExpression;
      right: IridiumExpression;
      metadata?: Metadata;
    }
  | { kind: "unary"; op: string; right: IridiumExpression; metadata?: Metadata }
  | {
      kind: "call";
      name: string;
      args: IridiumExpression[];
      metadata?: Metadata;
    };
