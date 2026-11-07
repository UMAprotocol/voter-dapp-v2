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

const notFoundMessage =
  /\b(?:transaction|receipt|txn?)\b.*\bnot (?:be )?found/i;

// Wallets may nest the RPC error, e.g. MetaMask's "Internal JSON-RPC error."
function isNotFoundError(error: unknown, depth = 0): boolean {
  if (depth > 3 || typeof error !== "object" || error === null) return false;
  const e = error as Record<string, unknown>;
  return (
    (typeof e.message === "string" && notFoundMessage.test(e.message)) ||
    [e.data, e.error, e.cause].some((inner) =>
      isNotFoundError(inner, depth + 1)
    )
  );
}
