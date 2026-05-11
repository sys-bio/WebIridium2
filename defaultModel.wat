(module
  (type (;0;) (func (param f64 i32 i32 i32) (result i32)))
  (import "iridium" "mem" (memory (;0;) 1))
  (func (;0;) (type 0) (param f64 i32 i32 i32) (result i32)
    (local f64 f64)
    (local.set 4
      (f64.mul
        (f64.load align=1
          (local.get 3))
        (f64.load align=1
          (local.get 1))))
    (local.set 5
      (f64.mul
        (f64.load offset=8 align=1
          (local.get 3))
        (f64.load offset=8 align=1
          (local.get 1))))
    (f64.store align=1
      (local.get 2)
      (f64.neg
        (local.get 4)))
    (f64.store offset=8 align=1
      (local.get 2)
      (f64.add
        (local.get 4)
        (f64.neg
          (local.get 5))))
    (f64.store offset=16 align=1
      (local.get 2)
      (local.get 5))
    (i32.const 0))
  (export "rhs" (func 0)))
