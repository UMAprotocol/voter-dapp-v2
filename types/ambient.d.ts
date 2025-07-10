// Ambient module declarations for packages that ship without types.

// @uma/contracts-frontend only ships ABI + JS, not .d.ts.  Treat as `any` to silence TS errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "@uma/contracts-frontend" {
  // minimal subset we use in the dApp. Add more exports as needed.
  export function getDesignatedVotingFactoryAddress(chainId: number): string;
  // Fallback for other exported members – typed as any for now.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _others: any;
  // eslint-disable-next-line import/no-default-export
  export default _others;
}