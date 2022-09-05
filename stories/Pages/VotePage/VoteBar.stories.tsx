import { Meta, Story } from "@storybook/react";
import { Props, VoteBar } from "components/VoteBar";
import { defaultVoteTimingContextState, VoteTimingContext } from "contexts/VoteTimingContext";
import { sub } from "date-fns";
import { VotePhaseT } from "types/global";

interface StoryProps extends Props {
  phase: VotePhaseT;
}

export default {
  title: "Pages/Vote Page/VoteBar",
  component: VoteBar,
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
      <VoteBar {...args} />
    </VoteTimingContext.Provider>
  );
};

const voteWithoutUserVote = {
  isCommitted: false,
  title: "SuperUMAn DAO KPI Options funding proposal",
  origin: "UMA" as const,
  description: "Some description",
  transactionHash: "0x1234567890",
  umipUrl: "https://uma.io",
  timeAsDate: sub(new Date(), { days: 1 }),
  time: sub(new Date(), { days: 1 }).getTime() / 1000,
  timeMilliseconds: sub(new Date(), { days: 1 }).getTime(),
  identifier: "0x1234567890",
  ancillaryData: "0x1234567890",
  decodedIdentifier: "SuperUMAn DAO KPI Options funding proposal",
  decodedAncillaryData: "Test test test",
  uniqueKey: "0x1234567890",
  umipNumber: 20,
  encryptedVote: undefined,
  decryptedVote: undefined,
  contentfulData: undefined,
  options: [
    { label: "Yes", value: "0", secondaryLabel: "p0" },
    { label: "No", value: "1", secondaryLabel: "p1" },
  ],
  links: [
    {
      label: "UMIP link",
      href: "https://www.todo.com",
    },
    {
      label: "Dispute txid",
      href: "https://www.todo.com",
    },
    {
      label: "Optimistic Oracle UI",
      href: "https://www.todo.com",
    },
  ],
  discordLink: "https://www.todo.com",
  isGovernance: false,
  isRevealed: false,
};

const userVote = {
  encryptedVote: "0x0",
  decryptedVote: {
    price: "0",
    salt: "0",
  },
};

const voteWithUserVote = {
  ...voteWithoutUserVote,
  ...userVote,
};

const voteCommitted = {
  ...voteWithUserVote,
  isCommitted: true,
};

const voteCommittedButNotRevealed = { ...voteCommitted };

const voteRevealed = { ...voteCommittedButNotRevealed, isRevealed: true };

const voteWithCorrectVoteWithoutUserVote = {
  ...voteWithoutUserVote,
  correctVote: 0,
};

const voteWithCorrectVoteWithUserVote = {
  ...voteWithUserVote,
  correctVote: 0,
};

const longTitle = "Will Coinbase support Polygon USDC deposits & withdrawals by June 30, 2022?";

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
