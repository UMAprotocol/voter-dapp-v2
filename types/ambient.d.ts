// Ambient module declarations for packages that ship without types.

// @uma/contracts-frontend only ships ABI + JS, not .d.ts.  Treat as `any` to silence TS errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "@uma/contracts-frontend" {
  const value: any;
  export = value;
}

// superstruct ships its own types, but the import paths we use sometimes confound tsc when
// `resolveJsonModule` or mixed ESM/CJS is enabled.  Provide a minimal fallback.
// Remove this once upstream typings work with our build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "superstruct" {
  export * from "superstruct/lib/index";
  // allow default import as any for convenience
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _default: any;
  export default _default;
}