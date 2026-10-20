import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveVotes } from "components/Votes/ActiveVotes";
import { getVotesToCommit } from "helpers/voting/getVotesToCommit";
import { getVotesToReveal } from "helpers/voting/getVotesToReveal";
import { VoteBatchProgress } from "helpers/voting/submitVoteBatches";
import { FormatVotesToCommit, SelectedVotesByKeyT, VoteT } from "types";

type ButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};
const state = vi.hoisted(() => ({
  phase: "commit",
  selectedVotes: {} as SelectedVotesByKeyT,
  votes: [] as VoteT[],
  buttons: [] as ButtonProps[],
  progress: undefined as VoteBatchProgress | undefined,
  isDelegate: false,
  revealAccount: undefined as string | undefined,
  commit: vi.fn(),
  reveal: vi.fn(),
  format: vi.fn<(args: FormatVotesToCommit) => Promise<VoteT[]>>(),
}));
vi.mock("@web3-onboard/react", () => ({
  useConnectWallet: () => [{ connecting: false }, vi.fn()],
}));
vi.mock("components", () => ({
  Button: (props: ButtonProps) => {
    state.buttons.push(props);
    return null;
  },
  IconWrapper: "span",
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
  VoteList: () => null,
  VoteTimeline: () => null,
}));
vi.mock("components/Votes/style", () => ({
  ButtonInnerWrapper: "div",
  ButtonOuterWrapper: "div",
  ButtonSpacer: "span",
  Divider: "hr",
  InfoText: "p",
  RecommittingVotesMessage: "p",
  Title: "h1",
  VotesTableWrapper: "div",
  WarningIcon: "svg",
}));
vi.mock("helpers", () => ({
  getPrecisionForIdentifier: () => 18,
  formatVotesToCommit: (args: FormatVotesToCommit) => state.format(args),
}));
vi.mock("helpers/config", () => ({ config: { properName: "Ethereum" } }));
vi.mock("hooks", () => ({
  useAccountDetails: () => ({ address: "voter" }),
  useCommitVotes: () => ({
    commitVotesMutation: state.commit,
    isCommittingVotes: state.phase === "commit" && !!state.progress,
    commitBatchProgress: state.progress,
    commitBatchSize: 100,
    getPendingVotes: (votes: VoteT[], selectedVotes: SelectedVotesByKeyT) =>
      getVotesToCommit(votes, selectedVotes),
  }),
  useRevealVotes: (address: string | undefined) => {
    state.revealAccount = address;
    return {
      revealVotesMutation: state.reveal,
      isRevealingVotes: state.phase === "reveal" && !!state.progress,
      revealBatchProgress: state.progress,
      revealBatchSize: 100,
      getPendingReveals: (votes: VoteT[]) => getVotesToReveal(votes),
    };
  },
  useContractsContext: () => ({ votingWriter: {} }),
  useDelegationContext: () => ({
    isDelegate: state.isDelegate,
    isDelegator: false,
    delegatorAddress: state.isDelegate ? "delegator" : undefined,
  }),
  useStakedBalance: () => ({ data: { gt: () => true } }),
  useVoteSelectionContext: () => ({
    selectedVotes: state.selectedVotes,
    selectVote: vi.fn(),
    setSelectedVotes: vi.fn(),
  }),
  useVotesContext: () => ({ activeVoteList: state.votes }),
  useVoteTimingContext: () => ({ phase: state.phase, roundId: 42 }),
  useVoteUrl: () => ({ openVote: vi.fn() }),
  useWalletContext: () => ({
    signingKeys: {
      voter: {
        publicKey: "public",
        privateKey: "private",
        signedMessage: "signed",
      },
    },
    signer: {},
    isWrongChain: false,
  }),
  useVotesWithOnScreenData: (votes: VoteT[]) => votes,
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.phase = "commit";
  state.progress = undefined;
  state.isDelegate = false;
  state.buttons = [];
  state.votes = Array.from(
    { length: 141 },
    (_, index) =>
      ({
        uniqueKey: `vote-${index}`,
        decodedIdentifier: "YES_OR_NO_QUERY",
        isCommitted: false,
        isRevealed: false,
        canReveal: true,
      } as VoteT)
  );
  state.selectedVotes = Object.fromEntries(
    state.votes.map((vote) => [vote.uniqueKey, "1"])
  );
  state.format.mockImplementation(({ votes }: FormatVotesToCommit) =>
    Promise.resolve(votes)
  );
});
describe("commit and reveal batching UI", () => {
  it("enables re-committing only changed answers after the entire round was committed", async () => {
    state.votes = state.votes.map((vote) => ({
      ...vote,
      isCommitted: true,
      decryptedVote: { price: "1000000000000000000", salt: "123" },
    }));
    state.selectedVotes["vote-1"] = "0";
    state.selectedVotes["vote-140"] = "2";
    renderToStaticMarkup(React.createElement(ActiveVotes));
    const button = state.buttons.find(
      (button) => button.label === "Commit 2/141 votes"
    );
    expect(button?.disabled).toBe(false);
    button?.onClick();
    await vi.waitFor(() => expect(state.commit).toHaveBeenCalledTimes(1));
    expect(state.format).toHaveBeenCalledWith(
      expect.objectContaining({ votes: [state.votes[1], state.votes[140]] })
    );
  });

  it("submits only selected answers and does not show a multi-transaction notice for a small selection", async () => {
    state.selectedVotes = { "vote-1": "0", "vote-10": "1" };
    const html = renderToStaticMarkup(React.createElement(ActiveVotes));
    const button = state.buttons.find(
      (button) => button.label === "Commit 2/141 votes"
    );
    expect(button?.disabled).toBe(false);
    expect(html).not.toContain("transactions");
    button?.onClick();
    await vi.waitFor(() => expect(state.commit).toHaveBeenCalled());
    expect(state.format).toHaveBeenCalledWith(
      expect.objectContaining({ votes: [state.votes[1], state.votes[10]] })
    );
  });

  it.each(["commit", "reveal"])(
    "shows the same red transaction count and progress during %s",
    (phase) => {
      state.phase = phase;
      if (phase === "reveal") {
        state.votes = state.votes.map((vote) => ({
          ...vote,
          isCommitted: true,
          decryptedVote: { price: "1000000000000000000", salt: "123" },
        }));
      }
      const html = renderToStaticMarkup(React.createElement(ActiveVotes));
      expect(html).toContain(
        '<strong class="text-red-500">2 transactions</strong>'
      );
      expect(html).toContain(
        phase === "commit" ? "committed in" : "revealed in"
      );
      expect(html).not.toContain("<select");
      state.progress = { current: 2, total: 2, submitted: false };
      renderToStaticMarkup(React.createElement(ActiveVotes));
      expect(state.buttons.at(-1)).toEqual(
        expect.objectContaining({
          label: "Submit batch 2 of 2",
          disabled: true,
        })
      );
      state.progress = { current: 2, total: 2, submitted: true };
      renderToStaticMarkup(React.createElement(ActiveVotes));
      expect(state.buttons.at(-1)).toEqual(
        expect.objectContaining({
          label: "Waiting for confirmations",
          disabled: true,
        })
      );
    }
  );

  it("reveals only eligible votes and uses the delegator's cache", () => {
    state.phase = "reveal";
    state.isDelegate = true;
    state.votes[10] = {
      ...state.votes[10],
      isCommitted: true,
      decryptedVote: { price: "1", salt: "123" },
    };
    renderToStaticMarkup(React.createElement(ActiveVotes));
    expect(state.revealAccount).toBe("delegator");
    const button = state.buttons.find(
      (button) => button.label === "Reveal 1/141 votes"
    );
    expect(button?.disabled).toBe(false);
    button?.onClick();
    expect(state.reveal).toHaveBeenCalledWith(
      expect.objectContaining({ votesToReveal: [state.votes[10]] })
    );
  });
});
