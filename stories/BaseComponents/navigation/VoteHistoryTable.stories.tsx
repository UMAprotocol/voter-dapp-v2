import { ComponentMeta, ComponentStory } from "@storybook/react";
import { VoteHistoryTable } from "components";
import { BigNumber } from "ethers";
import { voteWithCorrectVoteWithUserVote } from "stories/mocks/votes";
import { VoteT } from "types/global";

export default {
  title: "Base components/Navigation/VoteHistoryTable",
  component: VoteHistoryTable,
} as ComponentMeta<typeof VoteHistoryTable>;

const mockVoteHistory = {
  voted: false,
  correctness: false,
  staking: false,
  slashAmount: BigNumber.from(0),
};

function makeMockVotesWithHistory(args?: {
  voted?: boolean;
  correctness?: boolean;
  staking?: boolean;
  slashAmount?: BigNumber;
}) {
  const voteHistory = {
    ...mockVoteHistory,
    uniqueKey: `${Math.random()}`,
    ...args,
  };
  const votes = Array.from({ length: 10 }, (_, i) => ({
    ...voteWithCorrectVoteWithUserVote,
    voteNumber: BigNumber.from(i + 100),
    uniqueKey: `${Math.random()}`,
    voteHistory,
  }));

  return votes as VoteT[];
}

const Template: ComponentStory<typeof VoteHistoryTable> = (args) => <VoteHistoryTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  votes: makeMockVotesWithHistory(),
};
