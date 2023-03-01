import { Meta, Story } from "@storybook/react";
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

interface StoryProps {
  phase: "commit" | "reveal";
  activeVotes: VoteT[];
  upcomingVotes: VoteT[];
  pastVotes: VoteT[];
  activityStatus: ActivityStatusT;
}

export default {
  title: "Pages/Vote Page/VotePage",
  component: VotePage,
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
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
