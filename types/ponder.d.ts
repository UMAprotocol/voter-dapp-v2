declare module "ponder" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function defineConfig(config: any): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const onchainTable: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ponder: any;
}

declare module "ponder:registry" {
  // Re-export same symbols – ponder internally re-writes these imports.
  export * from "ponder";
}

declare module "ponder:schema" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any;
  export default schema;
}