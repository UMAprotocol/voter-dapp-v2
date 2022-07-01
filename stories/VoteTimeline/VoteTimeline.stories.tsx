import { ComponentStory, ComponentMeta } from "@storybook/react";
import { VoteTimeline } from "components/VoteTimeline";

export default {
  title: "VoteTimeline",
  component: VoteTimeline,
} as ComponentMeta<typeof VoteTimeline>;

const Template: ComponentStory<typeof VoteTimeline> = (args) => <VoteTimeline {...args} />;

export const NoPhase = Template.bind({});
NoPhase.args = {
  phase: null,
};
export const CommitPhase = Template.bind({});
CommitPhase.args = {
  phase: "commit",
};
export const RevealPhase = Template.bind({});
RevealPhase.args = {
  phase: "reveal",
};
