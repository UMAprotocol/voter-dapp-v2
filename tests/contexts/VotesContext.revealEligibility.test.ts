import { createElement, useContext } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VotesProvider, VotesContext } from "contexts/VotesContext";
import { getVotesToReveal } from "helpers/voting/getVotesToReveal";
import { VoteExistsByKeyT, VoteT } from "types";

const state = vi.hoisted(() => ({
  isDelegate: false,
  committedVotes: {} as VoteExistsByKeyT,
  committedVotesByCaller: {} as VoteExistsByKeyT,
  committedVotesForDelegator: {} as VoteExistsByKeyT,
  revealedVoteByAddress: {} as Record<string, string>,
}));

vi.mock("helpers", () => ({ getVoteMetaData: () => ({}) }));
vi.mock("hooks", () => ({
  useAccountDetails: () => ({
    address: state.isDelegate ? "delegate" : "main",
  }),
  useVoteTimingContext: () => ({ roundId: 10373 }),
  useDelegationContext: () => ({
    isDelegate: state.isDelegate,
    delegatorAddress: state.isDelegate ? "main" : undefined,
  }),
  useDesignatedVotingV1Address: () => ({}),
  useActiveVotes: () => ({
    data: Object.fromEntries(
      Array.from({ length: 141 }, (_, index) => [
        `vote-${index}`,
        {
          uniqueKey: `vote-${index}`,
          revealedVoteByAddress: state.revealedVoteByAddress,
        },
      ])
    ),
  }),
  useUpcomingVotes: () => ({ data: {} }),
  usePastVotes: () => ({ data: {} }),
  useCommittedVotes: () => ({ data: state.committedVotes }),
  useCommittedVotesByCaller: () => ({ data: state.committedVotesByCaller }),
  useCommittedVotesForDelegator: () => ({
    data: state.committedVotesForDelegator,
  }),
  useRevealedVotes: () => ({ data: {} }),
  useEncryptedVotes: () => ({ data: {} }),
  useDecryptedVotes: () => ({
    // Both accounts can still decrypt their own superseded commits.
    data: Object.fromEntries(
      Array.from({ length: 141 }, (_, index) => [
        `vote-${index}`,
        { price: "1", salt: "123" },
      ])
    ),
  }),
  useActiveVoteResults: () => ({}),
  useUserVotingAndStakingDetails: () => ({}),
  useDecodedAdminTransactions: () => ({}),
}));

function getActiveVotes() {
  let votes: VoteT[] = [];
  function Consumer() {
    votes = useContext(VotesContext).activeVoteList;
    return null;
  }
  renderToString(createElement(VotesProvider, null, createElement(Consumer)));
  return votes;
}

beforeEach(() => {
  state.isDelegate = false;
  state.committedVotes = {};
  state.committedVotesByCaller = {};
  state.committedVotesForDelegator = {};
  state.revealedVoteByAddress = {};
});

describe("reveal eligibility after commits from both accounts", () => {
  it.each([false, true])(
    "only reveals the connected account's latest commitments (delegate=%s)",
    (isDelegate) => {
      state.isDelegate = isDelegate;
      const latestCommits = Object.fromEntries(
        Array.from({ length: 141 }, (_, index) => [
          `vote-${index}`,
          index < 70 ? "latest-main" : "latest-delegate",
        ])
      );
      state.committedVotes = isDelegate ? {} : latestCommits;
      state.committedVotesForDelegator = isDelegate ? latestCommits : {};
      state.committedVotesByCaller = Object.fromEntries(
        Array.from({ length: 141 }, (_, index) => [
          `vote-${index}`,
          isDelegate
            ? index < 70
              ? "old-delegate"
              : "latest-delegate"
            : index < 70
            ? "latest-main"
            : "old-main",
        ])
      );
      const votes = getActiveVotes();
      expect(votes.every((vote) => vote.isCommitted)).toBe(true);
      expect(getVotesToReveal(votes).map((vote) => vote.uniqueKey)).toEqual(
        Array.from(
          { length: isDelegate ? 71 : 70 },
          (_, index) => `vote-${isDelegate ? index + 70 : index}`
        )
      );
    }
  );

  it.each([false, true])(
    "waits for the caller lookup to catch up with a re-commit (delegate=%s)",
    (isDelegate) => {
      state.isDelegate = isDelegate;
      if (isDelegate) {
        state.committedVotesForDelegator = { "vote-0": "new-commit" };
      } else {
        state.committedVotes = { "vote-0": "new-commit" };
      }
      for (const callerHash of [undefined, "old-commit"]) {
        state.committedVotesByCaller = { "vote-0": callerHash };
        expect(getVotesToReveal(getActiveVotes())).toEqual([]);
      }
      state.committedVotesByCaller = { "vote-0": "new-commit" };
      expect(
        getVotesToReveal(getActiveVotes()).map((vote) => vote.uniqueKey)
      ).toEqual(["vote-0"]);
    }
  );

  it("does not treat missing hashes as a matching commit", () => {
    expect(getVotesToReveal(getActiveVotes())).toEqual([]);
    state.isDelegate = true;
    expect(getVotesToReveal(getActiveVotes())).toEqual([]);
  });

  it("reveals for a delegate whose own stake is delegated to someone else", () => {
    state.isDelegate = true;
    // the connected address is the voter here because its own delegate
    // committed (and revealed) for it
    state.committedVotes = { "vote-0": "commit-by-own-delegate" };
    state.revealedVoteByAddress = { delegate: "999" };
    state.committedVotesForDelegator = { "vote-0": "commit-for-delegator" };
    state.committedVotesByCaller = { "vote-0": "commit-for-delegator" };
    const votes = getVotesToReveal(getActiveVotes());
    expect(votes.map((vote) => vote.uniqueKey)).toEqual(["vote-0"]);
    expect(votes[0]?.decryptedVote).toEqual({ price: "1", salt: "123" });
  });
});
