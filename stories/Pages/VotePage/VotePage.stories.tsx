import { Meta, Story, StoryObj } from "@storybook/react";
import {
  defaultVotesContextState,
  defaultVoteTimingContextState,
  VotesContext,
  VoteTimingContext,
} from "contexts";
import VotePage from "pages";
import {
  voteCommitted,
  voteCommittedButNotRevealed,
  voteRevealed,
  voteWithCorrectVoteWithoutUserVote,
  voteWithCorrectVoteWithUserVote,
  voteWithoutUserVote,
} from "stories/mocks/votes";
import { ActivityStatusT, VoteT } from "types";
import meta from "./VotesListItem.stories";

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

    const mockVotesContextState = {
      ...defaultVotesContextState,
      getActiveVotes: () => args.activeVotes ?? [],
      getUpcomingVotes: () => args.upcomingVotes ?? [],
      getPastVotes: () => args.pastVotes ?? [],
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

export const ActiveCommit = Template.bind({});
ActiveCommit.args = {
  activityStatus: "active",
  phase: "commit",
  activeVotes: [
    voteWithoutUserVote,
    voteCommitted,
    voteWithoutUserVote,
    voteCommitted,
  ],
};

export const ActiveReveal = Template.bind({});
ActiveReveal.args = {
  activityStatus: "active",
  phase: "reveal",
  activeVotes: [
    voteCommittedButNotRevealed,
    voteRevealed,
    voteCommittedButNotRevealed,
    voteRevealed,
  ],
};

export const Upcoming = Template.bind({});
Upcoming.args = {
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
};

export const Past = Template.bind({});
Past.args = {
  activityStatus: "past",
  pastVotes: [
    voteWithCorrectVoteWithUserVote,
    voteWithCorrectVoteWithoutUserVote,
    voteWithCorrectVoteWithUserVote,
    voteWithCorrectVoteWithoutUserVote,
  ],
};

export const With100Entries = Template.bind({});
With100Entries.args = {
  activityStatus: "past",
  pastVotes: Array.from({ length: 100 }, () => voteWithCorrectVoteWithUserVote),
};
