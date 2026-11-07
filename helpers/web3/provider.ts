import { ethers } from "ethers";

const retryDelaysMs = [1000, 2000, 4000, 8000];

// A load-balanced RPC can briefly report a just-broadcast transaction as not
// found. Retry those lookups with backoff instead of failing the transaction.
export class Web3Provider extends ethers.providers.Web3Provider {
  async perform(method: string, params: unknown): Promise<unknown> {
    for (let attempt = 0; ; attempt++) {
      try {
        return (await super.perform(method, params)) as unknown;
      } catch (error) {
        const delay = retryDelaysMs[attempt];
        const isTransactionLookup =
          method === "getTransaction" || method === "getTransactionReceipt";
        if (!isTransactionLookup || !isNotFoundError(error) || !delay) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

// Wallets may nest the RPC error, e.g. MetaMask's "Internal JSON-RPC error."
function isNotFoundError(error: unknown, depth = 0): boolean {
  if (depth > 3 || typeof error !== "object" || error === null) return false;
  const {
    message,
    data,
    error: inner,
    cause,
  } = error as Record<string, unknown>;
  return (
    (typeof message === "string" && /not (?:be )?found/i.test(message)) ||
    [data, inner, cause].some((e) => isNotFoundError(e, depth + 1))
  );
}
