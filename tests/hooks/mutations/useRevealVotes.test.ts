import {
  MutationObserver,
  QueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revealedVotesKey } from "constant";
import { getVotesToReveal } from "helpers/voting/getVotesToReveal";
import { formatVotesToReveal } from "helpers/voting/formatVotes";
import { useRevealVotes } from "hooks/mutations/votes/useRevealVotes";
import { RevealVotes, VoteExistsByKeyT, VoteT } from "types";

const state = vi.hoisted(() => ({
  roundId: 42,
  onError: vi.fn(),
  clearErrors: vi.fn(),
}));
let queryClient: QueryClient;
let mutation: MutationObserver<unknown, unknown, RevealVotes> | undefined;
let getPendingReveals: ReturnType<typeof useRevealVotes>["getPendingReveals"];

vi.mock("constant", async () => import("constant/query/queryKeys"));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => queryClient,
  useMutation: (options: UseMutationOptions<unknown, unknown, RevealVotes>) => {
    if (mutation) mutation.setOptions(options);
    else mutation = new MutationObserver(queryClient, options);
    return {
      mutate: (variables: RevealVotes) => mutation?.mutate(variables),
      isLoading: false,
    };
  },
}));
vi.mock("hooks", () => ({
  useVoteTimingContext: () => ({ roundId: state.roundId }),
  useHandleError: () => ({
    onError: state.onError,
    clearErrors: state.clearErrors,
  }),
}));
vi.mock("web3", async () => import("web3/mutations/votes/revealVotes"));
vi.mock("helpers", () => ({
  formatVotesToReveal: (votes: VoteT[]) => formatVotesToReveal(votes),
  getGasFeeOverrides: () => Promise.resolve({}),
  handleNotifications: async (tx: { wait: () => Promise<unknown> }) =>
    tx.wait(),
}));

type Receipt = { transactionHash: string };
type Transaction = { wait: () => Promise<Receipt> };

function renderHook(address = "voter") {
  function Harness() {
    getPendingReveals = useRevealVotes(address).getPendingReveals;
    return null;
  }
  renderToString(createElement(Harness));
}

function setup(count: number, address = "voter") {
  const votesToReveal = Array.from(
    { length: count },
    (_, index) =>
      ({
        uniqueKey: `vote-${index}`,
        identifier: "identifier",
        time: index,
        ancillaryData: "0x",
        isCommitted: true,
        isRevealed: false,
        canReveal: true,
        decryptedVote: { price: "1", salt: `${index}` },
      } as VoteT)
  );
  let transactionNumber = 0;
  const send = vi.fn<(...args: unknown[]) => Promise<Transaction | undefined>>(
    () => {
      const transactionHash = `tx-${++transactionNumber}`;
      return Promise.resolve({
        wait: () => Promise.resolve({ transactionHash }),
      });
    }
  );
  const voting = {
    provider: {},
    functions: { multicall: send, revealVote: send },
    interface: {
      getFunction: () => "revealVote",
      encodeFunctionData: (_fragment: string, args: unknown[]) =>
        JSON.stringify(args),
    },
  } as unknown as RevealVotes["voting"];
  renderHook(address);
  return { votesToReveal, voting, send };
}

beforeEach(() => {
  vi.clearAllMocks();
  state.roundId = 42;
  mutation = undefined;
  queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false, cacheTime: 0 } },
    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
  });
});

describe("automatic reveal batches", () => {
  it.each([
    [0, []],
    [1, [1]],
    [100, [100]],
    [101, [100, 1]],
    [141, [100, 41]],
    [201, [100, 100, 1]],
  ])(
    "reveals %i votes without repeating or skipping any",
    async (count, sizes) => {
      const { votesToReveal, voting, send } = setup(count);
      await mutation?.mutate({ voting, votesToReveal });
      expect(
        send.mock.calls.map((args) =>
          Array.isArray(args[0]) ? args[0].length : 1
        )
      ).toEqual(sizes);
      expect(
        send.mock.calls.flatMap((args) =>
          Array.isArray(args[0]) ? args[0] : [JSON.stringify(args.slice(0, 5))]
        )
      ).toEqual(
        votesToReveal.map((vote) =>
          JSON.stringify([
            vote.identifier,
            vote.time,
            vote.decryptedVote?.price,
            vote.ancillaryData,
            vote.decryptedVote?.salt,
          ])
        )
      );
      expect(getPendingReveals(votesToReveal)).toEqual([]);
    }
  );

  it("filters ineligible and already cached reveals before calculating batches", async () => {
    const { votesToReveal, voting, send } = setup(141);
    votesToReveal[0].isCommitted = false;
    votesToReveal[1].decryptedVote = undefined;
    votesToReveal[2].isRevealed = true;
    votesToReveal[3].isRevealed = undefined;
    votesToReveal[4].canReveal = false;
    queryClient.setQueryData([revealedVotesKey, "voter", 42], {
      "vote-5": "previous",
    });
    expect(getVotesToReveal(votesToReveal)).toHaveLength(136);
    expect(getPendingReveals(votesToReveal)).toHaveLength(135);
    await mutation?.mutate({ voting, votesToReveal });
    expect(send.mock.calls[0][0]).toHaveLength(100);
    expect(send.mock.calls[1][0]).toHaveLength(35);
  });

  it("submits the next reveal while the first is pending and retains the submitting account and round", async () => {
    const { votesToReveal, voting, send } = setup(141, "delegator");
    const getDelegatorPendingReveals = getPendingReveals;
    let confirm!: (receipt: Receipt) => void;
    const receipt = new Promise<Receipt>((resolve) => {
      confirm = resolve;
    });
    send.mockResolvedValueOnce({ wait: () => receipt });
    const pending = mutation?.mutate({ voting, votesToReveal });
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    expect(mutation?.getCurrentResult().isLoading).toBe(true);
    expect(
      queryClient.getQueryData<VoteExistsByKeyT>([
        revealedVotesKey,
        "delegator",
        42,
      ])?.["vote-0"]
    ).toBeUndefined();

    state.roundId = 43;
    renderHook("other-account");
    confirm({ transactionHash: "first-batch" });
    await pending;
    expect(
      queryClient.getQueryData([revealedVotesKey, "delegator", 42])
    ).toEqual(
      Object.fromEntries(
        votesToReveal.map((vote, index) => [
          vote.uniqueKey,
          index < 100 ? "first-batch" : "tx-1",
        ])
      )
    );
    expect(
      queryClient.getQueryData([revealedVotesKey, "other-account", 43])
    ).toBeUndefined();
    queryClient.setQueryData([revealedVotesKey, "delegator", 42], {});
    expect(getDelegatorPendingReveals(votesToReveal)).toEqual([]);
    expect(getPendingReveals(votesToReveal)).toEqual(votesToReveal);
  });

  it.each(["submission", "confirmation"])(
    "retains confirmed reveals after a stale refetch and a %s failure",
    async (failure) => {
      const { votesToReveal, voting, send } = setup(141);
      let finishRefetch!: (votes: VoteExistsByKeyT) => void;
      const refetch = queryClient.fetchQuery({
        queryKey: [revealedVotesKey, "voter", 42],
        queryFn: () =>
          new Promise<VoteExistsByKeyT>((resolve) => {
            finishRefetch = resolve;
          }),
      });
      send.mockResolvedValueOnce({
        wait: () => Promise.resolve({ transactionHash: "first-batch" }),
      });
      const error = new Error("Second batch failed");
      if (failure === "submission") send.mockRejectedValueOnce(error);
      else send.mockResolvedValueOnce({ wait: () => Promise.reject(error) });
      await expect(mutation?.mutate({ voting, votesToReveal })).rejects.toThrow(
        "Second batch failed"
      );
      expect(
        queryClient.getQueryData([revealedVotesKey, "voter", 42])
      ).toHaveProperty("vote-0", "first-batch");

      finishRefetch({});
      await refetch;
      expect(queryClient.getQueryData([revealedVotesKey, "voter", 42])).toEqual(
        {}
      );
      expect(getPendingReveals(votesToReveal)).toEqual(
        votesToReveal.slice(100)
      );
      await mutation?.mutate({ voting, votesToReveal });
      expect(send).toHaveBeenCalledTimes(3);
      expect(send.mock.calls[2][0]).toHaveLength(41);
      expect(getPendingReveals(votesToReveal)).toEqual([]);
    }
  );

  it.each(["submission", "confirmation"])(
    "retries only the remaining votes after a %s failure",
    async (failure) => {
      const { votesToReveal, voting, send } = setup(141);
      send.mockResolvedValueOnce({
        wait: () => Promise.resolve({ transactionHash: "first-batch" }),
      });
      const error = new Error("Second batch failed");
      if (failure === "submission") send.mockRejectedValueOnce(error);
      else send.mockResolvedValueOnce({ wait: () => Promise.reject(error) });
      await expect(mutation?.mutate({ voting, votesToReveal })).rejects.toThrow(
        "Second batch failed"
      );
      expect(getPendingReveals(votesToReveal)).toEqual(
        votesToReveal.slice(100)
      );
      await mutation?.mutate({ voting, votesToReveal });
      expect(send).toHaveBeenCalledTimes(3);
      expect(send.mock.calls[2][0]).toHaveLength(41);
      expect(
        queryClient.getQueryData<VoteExistsByKeyT>([
          revealedVotesKey,
          "voter",
          42,
        ])?.["vote-0"]
      ).toBe("first-batch");
    }
  );

  it("does not mark votes revealed without a submitted transaction", async () => {
    const { votesToReveal, voting, send } = setup(1);
    send.mockResolvedValueOnce(undefined);
    await mutation?.mutate({ voting, votesToReveal });
    expect(
      queryClient.getQueryData([revealedVotesKey, "voter", 42])
    ).toBeUndefined();
    expect(getPendingReveals(votesToReveal)).toEqual(votesToReveal);
  });
});
