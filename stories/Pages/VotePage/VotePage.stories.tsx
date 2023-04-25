import { Meta, StoryObj } from "@storybook/react";
import {
  VoteTimingContext,
  VotesContext,
  VotesContextState,
  defaultVoteTimingContextState,
  defaultVotesContextState,
} from "contexts";
import {
  computeMillisecondsUntilPhaseEnds,
  computePhaseEndTimeMilliseconds,
} from "helpers";
import VotePage from "pages";
import {
  makeMockVotes,
  mockCommitted,
  mockEncryptedAndDecrypted,
  polymarketVote,
  polymarketVoteCommitted,
  polymarketVoteCommittedCustomInput,
  polymarketVoteRevealed,
  polymarketVoteRevealedCustomInput,
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
      phaseEndTimeMilliseconds: computePhaseEndTimeMilliseconds(),
      phaseEndTimeAsDate: new Date(computePhaseEndTimeMilliseconds()),
      millisecondsUntilPhaseEnds: computeMillisecondsUntilPhaseEnds(),
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

const commitActiveVotes = makeMockVotes({
  inputs: [
    mockEncryptedAndDecrypted,
    mockCommitted,
    polymarketVote,
    polymarketVoteCommitted,
    polymarketVoteCommittedCustomInput,
  ],
});

const revealActiveVotes = makeMockVotes({
  inputs: [
    polymarketVote,
    polymarketVoteCommitted,
    polymarketVoteRevealed,
    polymarketVoteRevealedCustomInput,
  ],
});

const manyRevealActiveVotes = makeMockVotes({
  count: 100,
  inputs: [
    polymarketVote,
    polymarketVoteCommitted,
    polymarketVoteRevealed,
    polymarketVoteRevealedCustomInput,
  ],
});

const manyCommitActiveVotes = makeMockVotes({
  count: 100,
  inputs: [
    mockEncryptedAndDecrypted,
    mockCommitted,
    polymarketVote,
    polymarketVoteCommitted,
    polymarketVoteCommittedCustomInput,
  ],
});

const pastVotes = makeMockVotes({
  count: 100,
  inputs: [
    mockEncryptedAndDecrypted,
    mockCommitted,
    polymarketVote,
    polymarketVoteCommitted,
    polymarketVoteCommittedCustomInput,
  ],
});

const upcomingVotes = makeMockVotes({
  count: 5,
  inputs: [polymarketVote],
});

const manyUpcomingVotes = makeMockVotes({
  count: 100,
  inputs: [polymarketVote],
});

export const ActiveCommit: Story = {
  ...Template,
  args: {
    activityStatus: "active",
    phase: "commit",
    activeVotes: commitActiveVotes,
    pastVotes: pastVotes,
  },
};

export const ActiveCommitWithPagination: Story = {
  ...ActiveCommit,
  args: {
    ...ActiveCommit.args,
    activeVotes: manyCommitActiveVotes,
  },
};

export const ActiveCommitWithUpcoming: Story = {
  ...ActiveCommit,
  args: {
    ...ActiveCommit.args,
    upcomingVotes: upcomingVotes,
  },
};

export const ActiveCommitWithUpcomingWithPagination: Story = {
  ...ActiveCommitWithUpcoming,
  args: {
    ...ActiveCommitWithUpcoming.args,
    upcomingVotes: manyUpcomingVotes,
    activeVotes: manyCommitActiveVotes,
  },
};

export const ActiveReveal: Story = {
  ...Template,
  args: {
    activityStatus: "active",
    phase: "reveal",
    activeVotes: revealActiveVotes,
    pastVotes: pastVotes,
  },
};

export const ActiveRevealWithPagination: Story = {
  ...ActiveReveal,
  args: {
    ...ActiveReveal.args,
    activeVotes: manyRevealActiveVotes,
  },
};

export const ActiveRevealWithUpcoming = {
  ...ActiveReveal,
  args: {
    ...ActiveReveal.args,
    upcomingVotes: upcomingVotes,
  },
};

export const ActiveRevealWithUpcomingWithPagination: Story = {
  ...ActiveRevealWithUpcoming,
  args: {
    ...ActiveRevealWithUpcoming.args,
    upcomingVotes: manyUpcomingVotes,
    activeVotes: manyRevealActiveVotes,
  },
};

export const Upcoming: Story = {
  ...Template,
  args: {
    activityStatus: "upcoming",
    upcomingVotes: upcomingVotes,
    pastVotes: pastVotes,
  },
};

export const UpcomingWithPagination: Story = {
  ...Upcoming,
  args: {
    ...Upcoming.args,
    upcomingVotes: manyUpcomingVotes,
  },
};

export const Past: Story = {
  ...Template,
  args: {
    activityStatus: "past",
    pastVotes: pastVotes,
  },
};
