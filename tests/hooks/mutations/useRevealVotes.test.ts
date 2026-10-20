import { QueryClient, UseMutationOptions } from "@tanstack/react-query";
import { ContractReceipt } from "ethers";
import { getVotesToReveal } from "helpers/voting/getVotesToReveal";
import { useRevealVotes } from "hooks/mutations/votes/useRevealVotes";
import { RevealVotes, VoteExistsByKeyT, VoteT } from "types";
import { beforeEach, describe, expect, it, vi } from "vitest";

type MutationOptions = UseMutationOptions<
  ContractReceipt | undefined,
  unknown,
  RevealVotes,
  { queryKey: (string | number | undefined)[] }
>;

const state = vi.hoisted(() => ({
  client: undefined as unknown as QueryClient,
  options: undefined as unknown as MutationOptions,
  roundId: 100,
  onError: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => state.client,
  useMutation: (options: MutationOptions) => {
    state.options = options;
    return { mutate: vi.fn(), isLoading: false };
  },
}));
vi.mock("constant", () => ({ revealedVotesKey: "revealedVotesKey" }));
vi.mock("hooks", () => ({
  useVoteTimingContext: () => ({ roundId: state.roundId }),
  useHandleError: () => ({ onError: state.onError, clearErrors: vi.fn() }),
}));
vi.mock("web3", () => ({ revealVotes: vi.fn() }));

const receipt = { transactionHash: "0xconfirmed" } as ContractReceipt;
const cacheKey = (address = "voter", round = 100) => [
  "revealedVotesKey",
  address,
  round,
];
const makeVote = (index: number, overrides: Partial<VoteT> = {}) =>
  ({
    uniqueKey: `vote-${index}`,
    isCommitted: true,
    isRevealed: false,
    canReveal: true,
    decryptedVote: { price: "1", salt: "123" },
    ...overrides,
  } as VoteT);
const variables = (votesToReveal: VoteT[]) =>
  ({ votesToReveal } as RevealVotes);

beforeEach(() => {
  vi.clearAllMocks();
  state.client = new QueryClient();
  state.roundId = 100;
  useRevealVotes("voter");
});

describe("reveal batches", () => {
  it("keeps reveal-all as the default and filters ineligible votes before batching", () => {
    const eligible = [makeVote(1), makeVote(2)];
    const votes = [
      makeVote(3, { isCommitted: false }),
      makeVote(4, { decryptedVote: undefined }),
      makeVote(5, { isRevealed: true }),
      makeVote(6, { isRevealed: undefined }),
      makeVote(7, { canReveal: false }),
      ...eligible,
    ];

    expect(getVotesToReveal(votes)).toEqual(eligible);
    expect(getVotesToReveal(votes, 1)).toEqual([eligible[0]]);
    expect(getVotesToReveal([], 50)).toEqual([]);
  });

  it("reveals 141 votes in 50/50/41 batches without repeating or skipping votes", async () => {
    const votes = Array.from({ length: 141 }, (_, i) => makeVote(i));
    state.client.setQueryData(cacheKey(), { previousVote: "0xprevious" });
    const submitted: string[] = [];

    for (const expectedSize of [50, 50, 41]) {
      const revealed = state.client.getQueryData<VoteExistsByKeyT>(cacheKey());
      const remaining = votes.map((vote) => ({
        ...vote,
        isRevealed: !!revealed?.[vote.uniqueKey],
      }));
      const batch = getVotesToReveal(remaining, 50);
      expect(batch).toHaveLength(expectedSize);
      const args = variables(batch);
      const context = await state.options.onMutate?.(args);
      await state.options.onSuccess?.(receipt, args, context);
      submitted.push(...batch.map(({ uniqueKey }) => uniqueKey));
    }

    expect(submitted).toEqual(votes.map(({ uniqueKey }) => uniqueKey));
    expect(new Set(submitted).size).toBe(141);
    expect(state.client.getQueryData(cacheKey())).toEqual({
      previousVote: "0xprevious",
      ...Object.fromEntries(
        votes.map((vote) => [vote.uniqueKey, "0xconfirmed"])
      ),
    });
  });

  it.each(["wallet rejection", "transaction revert"])(
    "leaves a failed batch available after %s and allows a smaller retry",
    async (message) => {
      const votes = Array.from({ length: 3 }, (_, i) => makeVote(i));
      const args = variables(getVotesToReveal(votes, 2));
      const context = await state.options.onMutate?.(args);
      await state.options.onError?.(new Error(message), args, context);
      expect(state.client.getQueryData(cacheKey())).toBeUndefined();

      const retry = variables(getVotesToReveal(votes, 1));
      const retryContext = await state.options.onMutate?.(retry);
      await state.options.onSuccess?.(receipt, retry, retryContext);
      expect(state.client.getQueryData(cacheKey())).toEqual({
        "vote-0": "0xconfirmed",
      });
    }
  );

  it("does not mark votes revealed without a confirmed receipt", async () => {
    const args = variables([makeVote(0)]);
    const context = await state.options.onMutate?.(args);
    await state.options.onSuccess?.(undefined, args, context);
    expect(state.client.getQueryData(cacheKey())).toEqual({});
  });

  it("updates the delegator's cache and preserves the submitted account and round", async () => {
    useRevealVotes("delegator");
    const args = variables([makeVote(0)]);
    const context = await state.options.onMutate?.(args);

    state.roundId = 101;
    useRevealVotes("other-account");
    await state.options.onSuccess?.(receipt, args, context);

    expect(state.client.getQueryData(cacheKey("delegator"))).toEqual({
      "vote-0": "0xconfirmed",
    });
    expect(
      state.client.getQueryData(cacheKey("other-account", 101))
    ).toBeUndefined();
    expect(state.client.getQueryData(cacheKey("voter"))).toBeUndefined();
  });
});
