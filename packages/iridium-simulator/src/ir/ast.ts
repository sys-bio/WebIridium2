export type IridiumExpression = 
  | { kind: "number"; value: number }
  | { kind: "variable"; name: string }
  | { kind: "binary"; op: string; left: IridiumExpression; right: IridiumExpression }
  | { kind: "unary"; op: string; right: IridiumExpression }
  | { kind: "call"; name: string; args: IridiumExpression[] };
