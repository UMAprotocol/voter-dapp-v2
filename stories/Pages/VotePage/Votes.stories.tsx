import { Meta, Story } from "@storybook/react";
import { Votes } from "components";
import { desktopPageWidth } from "constant";
import {
  defaultVotesContextState,
  defaultVoteTimingContextState,
  VotesContext,
  VoteTimingContext,
} from "contexts";
import {
  defaultMockVote,
  mockCommitted,
  mockRevealed,
  voteCommittedButNotRevealed,
  voteWithCorrectVoteWithoutUserVote,
  voteWithCorrectVoteWithUserVote,
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
  title: "Pages/Vote Page/Votes",
  component: Votes,
  decorators: [
    (Story) => (
      <div style={{ width: desktopPageWidth }}>
        <Story />
      </div>
    ),
  ],
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
        <Votes />
      </VotesContext.Provider>
    </VoteTimingContext.Provider>
  );
};

export const ActiveCommit = Template.bind({});
ActiveCommit.args = {
  activityStatus: "active",
  phase: "commit",
  activeVotes: [defaultMockVote, mockCommitted, defaultMockVote, mockCommitted],
};

export const ActiveReveal = Template.bind({});
ActiveReveal.args = {
  activityStatus: "active",
  phase: "reveal",
  activeVotes: [
    voteCommittedButNotRevealed,
    mockRevealed,
    voteCommittedButNotRevealed,
    mockRevealed,
  ],
};

export const Upcoming = Template.bind({});
Upcoming.args = {
  activityStatus: "upcoming",
  upcomingVotes: [defaultMockVote, defaultMockVote, defaultMockVote],
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
