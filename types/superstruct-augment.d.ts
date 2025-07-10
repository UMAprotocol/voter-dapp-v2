import { Struct, Infer as _Infer } from "superstruct";

declare module "superstruct" {
  export type Infer<T extends Struct<any, any>> = _Infer<T>;
  export function defaulted<T, S extends Struct<T>>(struct: S, defaultValue: T): S;
}