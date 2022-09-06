import { Meta, Story } from "@storybook/react";
import { Props, VotesTableRow } from "components/VotesTable";
import { defaultVoteTimingContextState, VoteTimingContext } from "contexts/VoteTimingContext";
import {
  voteCommitted,
  voteCommittedButNotRevealed,
  voteRevealed,
  voteWithCorrectVoteWithoutUserVote,
  voteWithCorrectVoteWithUserVote,
  voteWithoutUserVote,
} from "stories/mocks/votes";
import { VotePhaseT } from "types/global";

interface StoryProps extends Props {
  phase: VotePhaseT;
}

export default {
  title: "Pages/Vote Page/VotesTableRow",
  component: VotesTableRow,
  decorators: [
    (Story) => (
      <div style={{ width: 1100 }}>
        <Story />
      </div>
    ),
  ],
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
  const mockVoteTimingContextState = { ...defaultVoteTimingContextState, phase: args.phase ?? "commit" };
  return (
    <VoteTimingContext.Provider value={mockVoteTimingContextState}>
      <VotesTableRow {...args} />
    </VoteTimingContext.Provider>
  );
};

const mockMoreDetailsAction = () => alert("More details clicked");

const commonArgs = {
  moreDetailsAction: mockMoreDetailsAction,
};

const activeVotesCommonArgs = {
  ...commonArgs,
  activityStatus: "active" as const,
};

const pastVoteCommonArgs = {
  ...commonArgs,
  activityStatus: "past" as const,
};

// active votes

// we only show `isCommitted` and `isRevealed` when we are dealing with active votes. This information is not relevant for upcoming votes, and it is redundant for past votes (we can simply show the user's votes instead).

export const ActiveNotCommitted = Template.bind({});
ActiveNotCommitted.args = {
  ...activeVotesCommonArgs,
  phase: "commit",
  vote: voteWithoutUserVote,
};

export const ActiveCommitted = Template.bind({});
ActiveCommitted.args = {
  ...activeVotesCommonArgs,
  phase: "commit",
  vote: voteCommitted,
};

export const ActiveNotRevealed = Template.bind({});
ActiveNotRevealed.args = {
  ...activeVotesCommonArgs,
  phase: "reveal",
  vote: voteCommittedButNotRevealed,
};

export const ActiveRevealed = Template.bind({});
ActiveRevealed.args = {
  ...activeVotesCommonArgs,
  phase: "reveal",
  vote: voteRevealed,
};

export const ActiveRevealButDidNotVote = Template.bind({});
ActiveRevealButDidNotVote.args = {
  ...activeVotesCommonArgs,
  phase: "reveal",
  vote: voteWithoutUserVote,
};
// upcoming votes

export const UpcomingVote = Template.bind({});

UpcomingVote.args = {
  ...commonArgs,
  vote: voteWithoutUserVote,
  activityStatus: "upcoming",
};

// past votes

export const PastVoteDidNotVote = Template.bind({});

PastVoteDidNotVote.args = {
  ...pastVoteCommonArgs,
  vote: voteWithCorrectVoteWithoutUserVote,
};

export const PastVoteDidVote = Template.bind({});

PastVoteDidVote.args = {
  ...pastVoteCommonArgs,
  vote: voteWithCorrectVoteWithUserVote,
};
