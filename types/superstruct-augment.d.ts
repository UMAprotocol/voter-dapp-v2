import { Struct } from "superstruct";

declare module "superstruct" {
  export function defaulted<T, S extends Struct<T>>(struct: S, defaultValue: T): S;
}