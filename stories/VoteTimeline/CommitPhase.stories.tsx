import { ComponentStory, ComponentMeta } from "@storybook/react";
import { CommitPhase } from "components/VoteTimeline";

export default {
  title: "VoteTimeline/CommitPhase",
  component: CommitPhase,
} as ComponentMeta<typeof CommitPhase>;

const Template: ComponentStory<typeof CommitPhase> = (args) => <CommitPhase {...args} />;

export const NotActive = Template.bind({});
NotActive.args = {
  active: false,
};

export const Active = Template.bind({});
Active.args = {
  active: true,
};
