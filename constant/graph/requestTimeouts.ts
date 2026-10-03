// Subgraph outages can hang connections open instead of erroring. Nothing
// above the fetch layer copes with a promise that never settles — react-query
// only retries on rejection and RPC fallbacks live in catch blocks — so
// subgraph requests are aborted after these windows. Values are deliberately
// generous (~5-10x the slowest healthy response) so a slow success is never
// cut off; the goal is only to turn "hangs forever" into a rejection.
export const SUBGRAPH_REQUEST_TIMEOUT_MS = 20_000;

// tighter on API routes so a hung subgraph returns a controlled error
// instead of burning the function's whole execution window
export const SERVER_SUBGRAPH_REQUEST_TIMEOUT_MS = 10_000;
