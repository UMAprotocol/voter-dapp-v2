import { ComponentStory, ComponentMeta } from "@storybook/react";
import { RevealPhase } from "components/VoteTimeline";

export default {
  title: "VoteTimeline/RevealPhase",
  component: RevealPhase,
} as ComponentMeta<typeof RevealPhase>;

const Template: ComponentStory<typeof RevealPhase> = (args) => <RevealPhase {...args} />;

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
