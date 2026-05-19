// spells \0ASM
export const MAGIC_WORD = [0x00, 0x61, 0x73, 0x6d];

export const VERSION_WORD = [0x01, 0x00, 0x00, 0x00];

export const ValType = {
  f64: 0x7c,
  f32: 0x7d,
  i64: 0x7e,
  i32: 0x7f,
} as const;

export type ValType = (typeof ValType)[keyof typeof ValType];

export const CompositeType = {
  func: 0x60,
} as const;

export type CompositeType = (typeof CompositeType)[keyof typeof CompositeType];

export const ExternType = {
  func: 0x00,
  mem: 0x02,
} as const;

export type ExternType = (typeof ExternType)[keyof typeof ExternType];

export const LimitFlag = {
  i32minOnly: 0x00,
  i32minMax: 0x01,
  i64minOnly: 0x04,
  i64minMax: 0x05,
} as const;

export type LimitFlag = (typeof LimitFlag)[keyof typeof LimitFlag];

export const SectionCode = {
  type: 0x01,
  import: 0x02,
  function: 0x03,
  export: 0x07,
  code: 0x0a,
} as const;

export type SectionCode = (typeof SectionCode)[keyof typeof SectionCode];

export const OpCode = {
  blockNoType: 0x40,
  if: 0x04,
  else: 0x05,
  call: 0x10,
  end: 0x0b,

  localget: 0x20,
  localset: 0x21,

  i32const: 0x41,
  i32add: 0x6a,
  i32eq: 0x46,
  i32ne: 0x47,
  i32lt_s: 0x48,
  i32gt_s: 0x4a,
  i32le_s: 0x4c,
  i32ge_s: 0x4e,

  f64const: 0x44,
  f64load: 0x2b,
  f64store: 0x39,

  f64abs: 0x99,
  f64neg: 0x9a,
  f64ceil: 0x9b,
  f64floor: 0x9c,
  f64trunc: 0x9d,
  f64nearest: 0x9e,
  f64sqrt: 0x9f,
  f64add: 0xa0,
  f64sub: 0xa1,
  f64mul: 0xa2,
  f64div: 0xa3,
  f64min: 0xa4,
  f64max: 0xa5,
  f64copysign: 0xa6,

  f64eq: 0x61,
  f64ne: 0x62,
  f64lt: 0x63,
  f64gt: 0x64,
  f64le: 0x65,
  f64ge: 0x66,

  f64convert_u_i32: 0xb8,
} as const;

export type OpCode = (typeof OpCode)[keyof typeof OpCode];
