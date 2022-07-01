import { ComponentStory, ComponentMeta } from "@storybook/react";
import { CommitPhase } from "components/VoteTimeline";

export default {
  title: "VoteTimeline/CommitPhase",
  component: CommitPhase,
} as ComponentMeta<typeof CommitPhase>;

const Template: ComponentStory<typeof CommitPhase> = (args) => <CommitPhase {...args} />;

export const Upcoming = Template.bind({});
Upcoming.args = {
  active: false,
  startsIn: "20h 10min",
  timeRemaining: null,
};

export const Active = Template.bind({});
Active.args = {
  active: true,
  startsIn: null,
  timeRemaining: "7h 43min",
};

export const Over = Template.bind({});
Over.args = {
  active: false,
  startsIn: null,
  timeRemaining: null,
};
