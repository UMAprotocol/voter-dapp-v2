import { ComponentMeta, ComponentStory } from "@storybook/react";
import { VoteHistoryTable } from "components";
import { BigNumber } from "ethers";
import { voteWithCorrectVoteWithUserVote } from "stories/mocks/votes";
import { VoteT } from "types/global";

export default {
  title: "Base components/Navigation/VoteHistoryTable",
  component: VoteHistoryTable,
  decorators: [
    (Story) => (
      <div style={{ width: 570 }}>
        <Story />
      </div>
    ),
  ],
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
  const votes = Array.from({ length: 10 }, (_, i) => ({
    ...voteWithCorrectVoteWithUserVote,
    voteNumber: BigNumber.from(i + 100),
    uniqueKey: `${Math.random()}`,
    voteHistory: {
      ...mockVoteHistory,
      ...args,
      uniqueKey: `${Math.random()}`,
      voted: args?.voted ?? Math.random() > 0.5,
      correctness: args?.correctness ?? Math.random() > 0.5,
      staking: args?.staking ?? Math.random() > 0.5,
      slashAmount:
        args?.slashAmount ?? BigNumber.from(Math.floor(Math.random() * 100) * (Math.random() > 0.5 ? -1 : 1)),
    },
  }));

  return votes as VoteT[];
}

const Template: ComponentStory<typeof VoteHistoryTable> = (args) => <VoteHistoryTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  votes: makeMockVotesWithHistory(),
};
