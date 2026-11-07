import { ethers } from "ethers";

// Some RPCs error on a transaction they haven't seen yet (desync, private
// submission). Return null instead so ethers keeps polling until it lands.
export class Web3Provider extends ethers.providers.Web3Provider {
  async perform(method: string, params: unknown): Promise<unknown> {
    try {
      return (await super.perform(method, params)) as unknown;
    } catch (error) {
      const isTransactionLookup =
        method === "getTransaction" || method === "getTransactionReceipt";
      if (isTransactionLookup && isNotFoundError(error)) return null;
      throw error;
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
