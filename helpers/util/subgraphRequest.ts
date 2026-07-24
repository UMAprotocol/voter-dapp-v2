import request, {
  RequestDocument,
  RequestExtendedOptions,
  Variables,
} from "graphql-request";
// deep import: the constant barrel transitively validates env, which must
// not run just because this fetch wrapper is imported (e.g. in tests)
import { SUBGRAPH_REQUEST_TIMEOUT_MS } from "constant/graph/requestTimeouts";

// graphql-request vendors its own DOM types, so the runtime AbortSignal needs
// a cast to satisfy its structurally-identical copy
type GraphqlRequestSignal = RequestExtendedOptions["signal"];

/**
 * graphql-request with an abort timeout. Every subgraph call must go through
 * this instead of calling `request` directly, so that a hung endpoint
 * rejects and the caller's retry/fallback path actually runs.
 */
export async function subgraphRequest<T, V extends Variables = Variables>(
  url: string,
  document: RequestDocument,
  variables?: V,
  timeoutMs: number = SUBGRAPH_REQUEST_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // the options form is the only request() signature accepting a signal;
    // its `variables` field is a conditional type that cannot be checked
    // against an unresolved generic, hence the assertion
    const options = {
      url,
      document,
      variables,
      signal: controller.signal as GraphqlRequestSignal,
    } as unknown as RequestExtendedOptions<V, T>;
    return await request<T, V>(options);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(
        `Subgraph request timed out after ${timeoutMs}ms: ${url}`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
