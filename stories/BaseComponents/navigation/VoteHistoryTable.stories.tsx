import { ComponentMeta, ComponentStory } from "@storybook/react";
import { VoteHistoryTable } from "components";
import { makeMockVotesWithHistory } from "stories/mocks/votes";

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

const Template: ComponentStory<typeof VoteHistoryTable> = (args) => <VoteHistoryTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  votes: makeMockVotesWithHistory(),
};
