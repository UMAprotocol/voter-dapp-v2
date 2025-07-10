declare module "superstruct" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function defaulted<S extends any>(struct: S, defaultValue: any): S;
}