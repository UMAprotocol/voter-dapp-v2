import {
  MutationObserver,
  QueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  committedVotesKey,
  committedVotesKeyByCaller,
  encryptedVotesKey,
} from "constant";
import { useCommitVotes } from "hooks/mutations/votes/useCommitVotes";
import { formatVotesToCommit } from "helpers/voting/formatVotes";
import { CommitVotes, VoteFormattedToCommitT } from "types";

const state = vi.hoisted(() => ({
  walletLabel: "MetaMask" as string | undefined,
  clearErrors: vi.fn(),
  onError: vi.fn(),
}));

let queryClient: QueryClient;
let mutation: MutationObserver<unknown, unknown, CommitVotes>;

vi.mock("constant", async () => import("constant/query/queryKeys"));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => queryClient,
  useMutation: (options: UseMutationOptions<unknown, unknown, CommitVotes>) => {
    mutation = new MutationObserver(queryClient, options);
    return {
      mutate: (variables: CommitVotes) => mutation.mutate(variables),
      isLoading: false,
    };
  },
}));
vi.mock("hooks", () => ({
  useAccountDetails: () => ({
    connectedWallet: state.walletLabel
      ? { label: state.walletLabel }
      : undefined,
  }),
  useVoteTimingContext: () => ({ roundId: 42 }),
  useHandleError: () => ({
    onError: state.onError,
    clearErrors: state.clearErrors,
  }),
}));
vi.mock("web3", async () => ({
  ...(await import("web3/mutations/votes/commitVotes")),
}));
vi.mock("helpers", () => ({
  getPrecisionForIdentifier: () => 18,
  getRandomSignedInt: () => 123,
  solidityKeccak256: (_types: string[], values: unknown[]) =>
    JSON.stringify(values),
  encryptMessage: (_publicKey: string, message: string) =>
    Promise.resolve(message),
  getGasFeeOverrides: () => Promise.resolve({}),
  handleNotifications: async (tx: { wait: () => Promise<unknown> }) =>
    tx.wait(),
}));

function setup(count: number) {
  const formattedVotes = Array.from(
    { length: count },
    (_, index) =>
      ({
        uniqueKey: `vote-${index}`,
        identifier: "identifier",
        decodedIdentifier: "YES_OR_NO_QUERY",
        time: index,
        ancillaryData: "0x",
        hash: `hash-${index}`,
        encryptedVote: `encrypted-${index}`,
        price: "1000000000000000000",
      } as VoteFormattedToCommitT)
  );
  let transactionNumber = 0;
  const send = vi.fn((..._args: unknown[]) => {
    const transactionHash = `tx-${++transactionNumber}`;
    return Promise.resolve({
      wait: () => Promise.resolve({ transactionHash }),
    });
  });
  const voting = {
    provider: {},
    functions: {
      multicall: send,
      commitAndEmitEncryptedVote: send,
    },
    interface: {
      getFunction: () => "commitAndEmitEncryptedVote",
      encodeFunctionData: (_fragment: string, args: unknown[]) =>
        JSON.stringify(args),
    },
  } as unknown as CommitVotes["voting"];
  let getPendingVotes!: ReturnType<typeof useCommitVotes>["getPendingVotes"];
  function Harness() {
    getPendingVotes = useCommitVotes("voter").getPendingVotes;
    return null;
  }
  renderToString(createElement(Harness));
  return { formattedVotes, voting, send, getPendingVotes };
}

beforeEach(() => {
  vi.clearAllMocks();
  state.walletLabel = "MetaMask";
  queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false, cacheTime: 0 } },
    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
  });
});

describe("commit batches", () => {
  it.each([
    [37, [37]],
    [101, [100, 1]],
  ])(
    "submits only %i selected answers from a 141-vote round",
    async (count, sizes) => {
      const { formattedVotes, voting, send, getPendingVotes } = setup(141);
      const selected = formattedVotes
        .filter((_, index) => index % 7 !== 0)
        .slice(0, count);
      const selections = Object.fromEntries(
        selected.map((vote, index) => [
          vote.uniqueKey,
          index % 2 === 0 ? "0" : "1",
        ])
      );
      const pendingVotes = getPendingVotes(formattedVotes, selections);
      expect(pendingVotes).toEqual(selected);
      const votes = await formatVotesToCommit({
        votes: pendingVotes,
        selectedVotes: selections,
        roundId: 42,
        address: "voter",
        signingKey: {
          publicKey: "public",
          privateKey: "private",
          signedMessage: "signed",
        },
      });
      await mutation.mutate({ voting, formattedVotes: votes });
      expect(
        send.mock.calls.map((args) =>
          Array.isArray(args[0]) ? args[0].length : 1
        )
      ).toEqual(sizes);
      expect(
        Object.keys(
          queryClient.getQueryData<Record<string, string>>([
            committedVotesKey,
            "voter",
            42,
          ]) ?? {}
        )
      ).toEqual(selected.map((vote) => vote.uniqueKey));
    }
  );

  it.each([
    [0, []],
    [1, [1]],
    [100, [100]],
    [101, [100, 1]],
    [141, [100, 41]],
    [200, [100, 100]],
    [201, [100, 100, 1]],
  ])("commits %i votes in bounded transactions", async (count, sizes) => {
    const { formattedVotes, voting, send } = setup(count);
    await mutation.mutate({ voting, formattedVotes });

    const calls = send.mock.calls;
    expect(
      calls.map((args) => (Array.isArray(args[0]) ? args[0].length : 1))
    ).toEqual(sizes);
    const encodedVotes = calls.flatMap((args) =>
      Array.isArray(args[0]) ? args[0] : [JSON.stringify(args.slice(0, 5))]
    );
    expect(encodedVotes).toEqual(
      formattedVotes.map((vote) =>
        JSON.stringify([
          vote.identifier,
          vote.time,
          vote.ancillaryData,
          vote.hash,
          vote.encryptedVote,
        ])
      )
    );
  });

  it.each(["MetaMask", "Rabby", "Coinbase Wallet", "WalletConnect", undefined])(
    "batches commits for %s",
    async (label) => {
      state.walletLabel = label;
      const { formattedVotes, voting, send } = setup(141);
      await mutation.mutate({ voting, formattedVotes });
      expect(send).toHaveBeenCalledTimes(2);
      expect(send).toHaveBeenCalledWith(expect.any(Array), {});
      expect(send.mock.calls[0][0]).toHaveLength(100);
      expect(send.mock.calls[1][0]).toHaveLength(41);
    }
  );

  it("submits the next batch before mining and caches each batch only when confirmed", async () => {
    const { formattedVotes, voting, send } = setup(141);
    let confirm!: (receipt: { transactionHash: string }) => void;
    const receipt = new Promise<{ transactionHash: string }>((resolve) => {
      confirm = resolve;
    });
    const waiting = vi.fn(() => receipt);
    send.mockResolvedValueOnce({ wait: waiting });
    const pending = mutation.mutate({ voting, formattedVotes });
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    expect(waiting).toHaveBeenCalled();
    expect(mutation.getCurrentResult().isLoading).toBe(true);
    expect(queryClient.getQueryData([committedVotesKey, "voter", 42])).toEqual(
      Object.fromEntries(
        formattedVotes.slice(100).map((vote) => [vote.uniqueKey, "tx-1"])
      )
    );

    confirm({ transactionHash: "first-batch" });
    await pending;
    for (const key of [committedVotesKey, committedVotesKeyByCaller]) {
      const committed = queryClient.getQueryData([key, "voter", 42]);
      expect(committed).toEqual(
        Object.fromEntries(
          formattedVotes.map((vote, index) => [
            vote.uniqueKey,
            index < 100 ? "first-batch" : "tx-1",
          ])
        )
      );
    }
    expect(queryClient.getQueryData([encryptedVotesKey, "voter", 42])).toEqual(
      Object.fromEntries(
        formattedVotes.map((vote) => [vote.uniqueKey, vote.encryptedVote])
      )
    );
  });

  it("waits for each broadcast before opening the next wallet request", async () => {
    const { formattedVotes, voting, send } = setup(141);
    let broadcast!: (tx: {
      wait: () => Promise<{ transactionHash: string }>;
    }) => void;
    send.mockReturnValueOnce(
      new Promise((resolve) => {
        broadcast = resolve;
      })
    );
    const pending = mutation.mutate({ voting, formattedVotes });
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    expect(
      queryClient.getQueryData([committedVotesKey, "voter", 42])
    ).toBeUndefined();

    broadcast({
      wait: () => Promise.resolve({ transactionHash: "first-batch" }),
    });
    await pending;
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("retries only failed votes even when formatting generates new hashes and ciphertext", async () => {
    const { formattedVotes, voting, send, getPendingVotes } = setup(141);
    send
      .mockResolvedValueOnce({
        wait: () => Promise.resolve({ transactionHash: "first-batch" }),
      })
      .mockRejectedValueOnce(new Error("User rejected the transaction"));
    await expect(mutation.mutate({ voting, formattedVotes })).rejects.toThrow();
    const selections = Object.fromEntries(
      formattedVotes.map((vote) => [vote.uniqueKey, "1"])
    );
    expect(getPendingVotes(formattedVotes, selections)).toEqual(
      formattedVotes.slice(100)
    );

    const retryVotes = formattedVotes.map((vote) => ({
      ...vote,
      hash: `retry-${vote.hash}`,
      encryptedVote: `retry-${vote.encryptedVote}`,
    }));
    await mutation.mutate({ voting, formattedVotes: retryVotes });

    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls[2][0]).toHaveLength(41);
    expect(queryClient.getQueryData([committedVotesKey, "voter", 42])).toEqual(
      Object.fromEntries(
        formattedVotes.map((vote, index) => [
          vote.uniqueKey,
          index < 100 ? "first-batch" : "tx-1",
        ])
      )
    );
    expect(
      queryClient.getQueryData<Record<string, string>>([
        encryptedVotesKey,
        "voter",
        42,
      ])?.["vote-0"]
    ).toBe("encrypted-0");
  });

  it("includes deliberate edits to confirmed votes when retrying", async () => {
    const { formattedVotes, voting, send, getPendingVotes } = setup(141);
    send
      .mockResolvedValueOnce({
        wait: () => Promise.resolve({ transactionHash: "first-batch" }),
      })
      .mockRejectedValueOnce(new Error("User rejected the transaction"));
    await expect(mutation.mutate({ voting, formattedVotes })).rejects.toThrow();

    const selections = Object.fromEntries(
      formattedVotes.map((vote, index) => [
        vote.uniqueKey,
        index === 0 ? "2" : "1",
      ])
    );
    expect(getPendingVotes(formattedVotes, selections)).toHaveLength(42);
    const retryVotes = formattedVotes.map((vote, index) => ({
      ...vote,
      price: index === 0 ? "2000000000000000000" : vote.price,
      hash: `retry-${vote.hash}`,
      encryptedVote: `retry-${vote.encryptedVote}`,
    }));
    await mutation.mutate({ voting, formattedVotes: retryVotes });
    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls[2][0]).toHaveLength(42);
    expect(getPendingVotes(formattedVotes, selections)).toEqual([]);
  });

  it("does not skip a vote if its cached commit has since changed", async () => {
    const { formattedVotes, voting, send, getPendingVotes } = setup(1);
    await mutation.mutate({ voting, formattedVotes });
    queryClient.setQueryData([committedVotesKey, "voter", 42], {
      "vote-0": "another-commit",
    });
    expect(getPendingVotes(formattedVotes, { "vote-0": "1" })).toHaveLength(1);
    await mutation.mutate({ voting, formattedVotes });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it.each(["submission", "confirmation"])(
    "preserves successful batches when another batch fails during %s",
    async (failure) => {
      const { formattedVotes, voting, send } = setup(241);
      const error = new Error("Batch failed");
      send.mockResolvedValueOnce({
        wait: () => Promise.resolve({ transactionHash: "first-batch" }),
      });
      if (failure === "submission") {
        send.mockRejectedValueOnce(error);
      } else {
        send.mockResolvedValueOnce({
          wait: () => Promise.reject(error),
        });
      }

      await expect(mutation.mutate({ voting, formattedVotes })).rejects.toThrow(
        "Batch failed"
      );
      expect(send).toHaveBeenCalledTimes(failure === "submission" ? 2 : 3);
      expect(state.onError).toHaveBeenCalled();
      for (const key of [
        committedVotesKey,
        committedVotesKeyByCaller,
        encryptedVotesKey,
      ]) {
        const cached = queryClient.getQueryData<Record<string, string>>([
          key,
          "voter",
          42,
        ]);
        expect(Object.keys(cached ?? {})).toHaveLength(
          failure === "submission" ? 100 : 141
        );
        expect(cached?.["vote-100"]).toBeUndefined();
      }
    }
  );

  it("keeps tracking a pending batch after the next wallet request is rejected", async () => {
    const { formattedVotes, voting, send } = setup(241);
    let confirm!: (receipt: { transactionHash: string }) => void;
    const receipt = new Promise<{ transactionHash: string }>((resolve) => {
      confirm = resolve;
    });
    send.mockResolvedValueOnce({ wait: () => receipt });
    send.mockRejectedValueOnce(new Error("User rejected the transaction"));
    const result = mutation
      .mutate({ voting, formattedVotes })
      .catch((error: unknown) => error);
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    expect(mutation.getCurrentResult().isLoading).toBe(true);
    expect(
      queryClient.getQueryData([committedVotesKey, "voter", 42])
    ).toBeUndefined();

    confirm({ transactionHash: "first-batch" });
    expect(await result).toEqual(new Error("User rejected the transaction"));
    expect(send).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryData([committedVotesKey, "voter", 42])).toEqual(
      Object.fromEntries(
        formattedVotes
          .slice(0, 100)
          .map((vote) => [vote.uniqueKey, "first-batch"])
      )
    );
  });

  it("keeps tracking other submitted batches when one transaction fails to confirm", async () => {
    const { formattedVotes, voting, send } = setup(141);
    let reject!: (error: Error) => void;
    let confirm!: (receipt: { transactionHash: string }) => void;
    const firstReceipt = new Promise<{ transactionHash: string }>(
      (_resolve, rejectPromise) => {
        reject = rejectPromise;
      }
    );
    const secondReceipt = new Promise<{ transactionHash: string }>(
      (resolve) => {
        confirm = resolve;
      }
    );
    send.mockResolvedValueOnce({ wait: () => firstReceipt });
    send.mockResolvedValueOnce({ wait: () => secondReceipt });
    const result = mutation
      .mutate({ voting, formattedVotes })
      .catch((error: unknown) => error);
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    reject(new Error("Transaction reverted"));
    // Allow the first transaction's failure handler to run.
    await firstReceipt.catch(() => undefined);
    expect(mutation.getCurrentResult().isLoading).toBe(true);
    confirm({ transactionHash: "second-batch" });

    expect(await result).toEqual(new Error("Transaction reverted"));
    expect(queryClient.getQueryData([committedVotesKey, "voter", 42])).toEqual(
      Object.fromEntries(
        formattedVotes
          .slice(100)
          .map((vote) => [vote.uniqueKey, "second-batch"])
      )
    );
  });
});
