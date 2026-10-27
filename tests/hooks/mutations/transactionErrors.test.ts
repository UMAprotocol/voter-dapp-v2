import {
  MutationObserver,
  QueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { SettledEventT } from "types";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  events,
  emitErrorEvent,
  emitPendingEvent,
  emitSuccessEvent,
} from "helpers/web3/events";
import { formatTransactionError } from "helpers/web3/ethers";
import { handleNotifications } from "helpers/util/handleNotifications";
import { useHandleError } from "hooks/helpers/useHandleError";
import { useCommitVotes } from "hooks/mutations/votes/useCommitVotes";
import { useRevealVotes } from "hooks/mutations/votes/useRevealVotes";
import { useStake } from "hooks/mutations/staking/useStake";

const state = vi.hoisted(() => ({
  addErrorMessage: vi.fn(),
  clearErrorMessages: vi.fn(),
  errorMessages: [] as string[],
}));
let queryClient: QueryClient;
let mutation: MutationObserver<unknown, unknown, unknown>;
vi.mock("constant", async () => ({
  ...(await import("constant/query/queryKeys")),
  wrongChainMessage: "Wrong chain",
  errorFetchingVoteDataMessage: "Failed to fetch vote data",
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => queryClient,
  useMutation: (options: UseMutationOptions<unknown, unknown, unknown>) => {
    mutation = new MutationObserver(queryClient, options);
    return { mutate: mutation.mutate.bind(mutation), isLoading: false };
  },
}));
vi.mock("hooks", () => ({
  useHandleError: (...args: Parameters<typeof useHandleError>) =>
    useHandleError(...args),
  useErrorContext: () => state,
  useVoteTimingContext: () => ({ roundId: 42 }),
}));
vi.mock("helpers", () => ({
  emitErrorEvent: (...args: Parameters<typeof emitErrorEvent>) =>
    emitErrorEvent(...args),
  emitPendingEvent: (...args: Parameters<typeof emitPendingEvent>) =>
    emitPendingEvent(...args),
  emitSuccessEvent: (...args: Parameters<typeof emitSuccessEvent>) =>
    emitSuccessEvent(...args),
  formatTransactionError: (
    ...args: Parameters<typeof formatTransactionError>
  ) => formatTransactionError(...args),
  handleNotifications: (...args: Parameters<typeof handleNotifications>) =>
    handleNotifications(...args),
  capitalizeFirstLetter: (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1),
  formatNumberForDisplay: () => "1",
  formatVotesToReveal: (votes: unknown[]) => votes,
  getGasFeeOverrides: () => Promise.resolve({}),
}));
vi.mock("web3", async () => ({
  ...(await import("web3/mutations/votes/commitVotes")),
  ...(await import("web3/mutations/votes/revealVotes")),
  ...(await import("web3/mutations/staking/stake")),
}));

const notification = vi.fn<(event: SettledEventT) => void>();
beforeEach(() => {
  vi.clearAllMocks();
  state.errorMessages = [];
  events.removeAllListeners();
  events.on("error", notification);
  queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false, cacheTime: 0 } },
    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
  });
});

function setup(
  action: "commit" | "reveal" | "stake",
  send: ReturnType<typeof vi.fn>
) {
  function CommitHarness() {
    useCommitVotes("voter");
    return null;
  }
  function RevealHarness() {
    useRevealVotes("voter");
    return null;
  }
  function StakeHarness() {
    useStake({ address: "voter", errorOrigin: "stake" });
    return null;
  }
  const Harness = {
    commit: CommitHarness,
    reveal: RevealHarness,
    stake: StakeHarness,
  }[action];
  renderToString(createElement(Harness));
  const vote = {
    uniqueKey: "vote",
    price: "1",
    isCommitted: true,
    isRevealed: false,
    canReveal: true,
    decryptedVote: { price: "1", salt: "1" },
  };
  return {
    voting: {
      provider: {},
      functions: {
        commitAndEmitEncryptedVote: send,
        revealVote: send,
        stake: send,
      },
    },
    formattedVotes: [vote],
    votesToReveal: [vote],
    stakeAmount: BigNumber.from(1),
  };
}

describe("transaction error notifications", () => {
  it.each(["commit", "reveal", "stake"] as const)(
    "notifies when %s fails before broadcast",
    async (action) => {
      const error = Object.assign(
        new Error(
          "insufficient funds for intrinsic transaction cost (code=INSUFFICIENT_FUNDS)"
        ),
        { code: "INSUFFICIENT_FUNDS" }
      );
      const variables = setup(action, vi.fn().mockRejectedValue(error));
      await expect(mutation.mutate(variables)).rejects.toBe(error);
      expect(notification).toHaveBeenCalledOnce();
      expect(notification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/insufficient.*gas/i) as string,
          pendingId: expect.any(String) as string,
        })
      );
      expect(state.addErrorMessage).toHaveBeenCalled();
    }
  );

  it("keeps a single notification for a failure after broadcast", async () => {
    const error = new Error("transaction failed");
    const variables = setup(
      "stake",
      vi
        .fn()
        .mockResolvedValue({ hash: "0x123", wait: () => Promise.reject(error) })
    );
    await expect(mutation.mutate(variables)).rejects.toBe(error);
    expect(notification).toHaveBeenCalledOnce();
    expect(state.addErrorMessage).toHaveBeenCalled();
  });

  it("does not notify for background query failures", () => {
    useHandleError({ isDataFetching: true }).onError(
      new Error("RPC unavailable")
    );
    expect(notification).not.toHaveBeenCalled();
    expect(state.addErrorMessage).toHaveBeenCalledWith(
      "Failed to fetch vote data"
    );
  });
});

describe("wallet error messages", () => {
  it.each([
    { code: "INSUFFICIENT_FUNDS" },
    {
      message: "cannot estimate gas",
      error: { message: "insufficient funds for gas * price + value" },
    },
    {
      message: "Internal JSON-RPC error",
      data: { originalError: { code: "INSUFFICIENT_FUNDS" } },
    },
    "insufficient funds for intrinsic transaction cost",
    "insufficient funds for gas * price + value",
  ])(
    "explains insufficient gas for wrapped and plain wallet errors",
    (error) => {
      useHandleError().onError(error);
      expect(notification).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            "Insufficient ETH to pay for gas. Add ETH to your wallet and try again.",
        })
      );
    }
  );

  it.each([
    [
      new Error("execution reverted: insufficient funds"),
      "Execution reverted: insufficient funds",
    ],
    [
      { code: "CALL_EXCEPTION", reason: "insufficient funds" },
      "Insufficient funds",
    ],
    [
      new Error("insufficient gas for code deposit"),
      "Insufficient gas for code deposit",
    ],
    [
      {
        message: "cannot estimate gas",
        error: { message: "execution reverted: insufficient funds" },
      },
      "Cannot estimate gas",
    ],
    [
      new Error("execution reverted: insufficient funds for gas"),
      "Execution reverted: insufficient funds for gas",
    ],
    [
      new Error("execution reverted: voting is closed (code=CALL_EXCEPTION)"),
      "Execution reverted: voting is closed",
    ],
    [
      { code: 4001, message: "User rejected the request." },
      "User rejected the request.",
    ],
    [undefined, "Transaction failed. Please try again."],
  ])(
    "shows useful messages for other transaction failures",
    (error, message) => {
      useHandleError().onError(error);
      expect(notification).toHaveBeenCalledWith(
        expect.objectContaining({ message })
      );
    }
  );

  it("does not let an existing wrong-chain error hide a transaction failure", () => {
    state.errorMessages = ["Wrong chain"];
    useHandleError().onError(new Error("transaction failed"));
    expect(notification).toHaveBeenCalledOnce();
  });

  it("gives separate attempts distinct notifications", () => {
    const { onError } = useHandleError();
    onError(new Error("transaction failed"));
    onError(new Error("transaction failed"));
    const [first, second] = notification.mock.calls.map(([event]) => event);
    expect(first.pendingId).not.toBe(second.pendingId);
    expect(first.pendingId).toBe(first.id);
  });

  it("handles circular wallet error objects", () => {
    const error = { message: "RPC unavailable", cause: {} };
    error.cause = error;
    expect(formatTransactionError(error)).toBe("RPC unavailable");
  });
});
