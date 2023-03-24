import { Meta, StoryObj } from "@storybook/react";
import { VotesList, VotesListItem, VotesTableHeadings } from "components";
import { useState } from "react";
import {
  polymarketVote,
  voteCommitted,
  voteCommittedButNotRevealed,
  voteRevealed,
  voteWithCorrectVoteWithoutUserVote,
  voteWithCorrectVoteWithUserVote,
  voteWithoutUserVote,
} from "stories/mocks/votes";

const meta: Meta = {
  title: "Pages/Vote Page/VotesListItem",
  component: VotesListItem,
};

export default meta;

type Story = StoryObj<typeof VotesListItem>;

const Template: Story = {
  render: function Wrapper(args) {
    const [selectedVote, setSelectedVote] = useState<string | undefined>(
      undefined
    );
    return (
      <div style={{ maxWidth: "var(--page-width)" }}>
        <VotesList
          headings={<VotesTableHeadings {...args} />}
          rows={[
            <VotesListItem
              {...args}
              key="only one here"
              selectedVote={selectedVote}
              selectVote={setSelectedVote}
            />,
          ]}
        />
      </div>
    );
  },
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

export const ActiveNotCommitted = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit",
    vote: voteWithoutUserVote,
  },
};

export const ActiveCommitted = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit",
    vote: voteCommitted,
  },
};

export const ActiveNotRevealed = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "reveal",
    vote: voteCommittedButNotRevealed,
  },
};

export const ActiveRevealed = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "reveal",
    vote: voteRevealed,
  },
};

export const ActiveRevealButDidNotVote = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "reveal",
    vote: voteWithoutUserVote,
  },
};

// upcoming votes

export const UpcomingVote = {
  ...Template,
  args: {
    ...commonArgs,
    vote: voteWithoutUserVote,
    activityStatus: "upcoming",
  },
};

// past votes

export const PastVoteDidNotVote = {
  ...Template,
  args: {
    ...pastVoteCommonArgs,
    vote: voteWithCorrectVoteWithoutUserVote,
  },
};

export const PastVoteDidVote = {
  ...Template,
  args: {
    ...pastVoteCommonArgs,
    vote: voteWithCorrectVoteWithUserVote,
  },
};

export const PolymarketNotCommitted = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit",
    vote: polymarketVote,
  },
};
