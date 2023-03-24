import { Meta, StoryObj } from "@storybook/react";
import {
  defaultVotesContextState,
  defaultVoteTimingContextState,
  VotesContext,
  VotesContextState,
  VoteTimingContext,
} from "contexts";
import VotePage from "pages";
import {
  polymarketVote,
  voteCommitted,
  voteCommittedButNotRevealed,
  voteRevealed,
  voteWithCorrectVoteWithoutUserVote,
  voteWithCorrectVoteWithUserVote,
  voteWithoutUserVote,
} from "stories/mocks/votes";
import { ActivityStatusT, VoteT } from "types";

interface Args {
  phase: "commit" | "reveal";
  activeVotes: VoteT[];
  upcomingVotes: VoteT[];
  pastVotes: VoteT[];
  activityStatus: ActivityStatusT;
}

const meta: Meta = {
  title: "Pages/Vote Page/VotePage",
  component: VotePage,
};

export default meta;

type Story = StoryObj<Args>;

const Template: Story = {
  render: function Wrapper(args) {
    const mockVoteTimingContextState = {
      ...defaultVoteTimingContextState,
      phase: args.phase ?? "commit",
      roundId: 1,
    };

    const mockVotesContextState: VotesContextState = {
      ...defaultVotesContextState,
      activeVotesList: args.activeVotes ?? [],
      upcomingVotesList: args.upcomingVotes ?? [],
      pastVotesList: args.pastVotes ?? [],
      getActivityStatus: () => args.activityStatus ?? "past",
    };

    return (
      <VoteTimingContext.Provider value={mockVoteTimingContextState}>
        <VotesContext.Provider value={mockVotesContextState}>
          <VotePage />
        </VotesContext.Provider>
      </VoteTimingContext.Provider>
    );
  },
};

export const ActiveCommit: Story = {
  ...Template,
  args: {
    activityStatus: "active",
    phase: "commit",
    activeVotes: [
      voteWithoutUserVote,
      polymarketVote,
      voteCommitted,
      voteWithoutUserVote,
      voteCommitted,
    ],
  },
};

export const ActiveReveal: Story = {
  ...Template,
  args: {
    activityStatus: "active",
    phase: "reveal",
    activeVotes: [
      voteCommittedButNotRevealed,
      voteRevealed,
      voteCommittedButNotRevealed,
      voteRevealed,
    ],
  },
};

export const Upcoming: Story = {
  ...Template,
  args: {
    activityStatus: "upcoming",
    upcomingVotes: [
      voteWithoutUserVote,
      voteWithoutUserVote,
      voteWithoutUserVote,
    ],
    pastVotes: [
      voteWithCorrectVoteWithUserVote,
      voteWithCorrectVoteWithoutUserVote,
      voteWithCorrectVoteWithUserVote,
      voteWithCorrectVoteWithoutUserVote,
    ],
  },
};

export const Past: Story = {
  ...Template,
  args: {
    activityStatus: "past",
    pastVotes: [
      voteWithCorrectVoteWithUserVote,
      voteWithCorrectVoteWithoutUserVote,
      voteWithCorrectVoteWithUserVote,
      voteWithCorrectVoteWithoutUserVote,
    ],
  },
};

export const With100Entries: Story = {
  ...Template,
  args: {
    activityStatus: "past",
    pastVotes: Array.from(
      { length: 100 },
      () => voteWithCorrectVoteWithUserVote
    ),
  },
};
