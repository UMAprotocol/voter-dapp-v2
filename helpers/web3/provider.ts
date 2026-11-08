import { ethers } from "ethers";
import * as ss from "superstruct";

// Some RPCs error on a transaction they haven't seen yet (desync, private
// submission). Return null instead so ethers keeps polling until it lands.
export class Web3Provider extends ethers.providers.Web3Provider {
  async perform(method: string, params: unknown): Promise<unknown> {
    try {
      const result: unknown = await super.perform(method, params);
      return result;
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
const RpcError = ss.type({
  message: ss.optional(ss.unknown()),
  data: ss.optional(ss.unknown()),
  error: ss.optional(ss.unknown()),
  cause: ss.optional(ss.unknown()),
});

function isNotFoundError(error: unknown, depth = 0): boolean {
  if (depth > 3 || !ss.is(error, RpcError)) return false;
  return (
    (typeof error.message === "string" &&
      notFoundMessage.test(error.message)) ||
    [error.data, error.error, error.cause].some((inner) =>
      isNotFoundError(inner, depth + 1)
    )
  );
}
