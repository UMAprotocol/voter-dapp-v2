import { ComponentStory, ComponentMeta } from "@storybook/react";
import { RevealPhase } from "components/VoteTimeline";

export default {
  title: "VoteTimeline/RevealPhase",
  component: RevealPhase,
} as ComponentMeta<typeof RevealPhase>;

const Template: ComponentStory<typeof RevealPhase> = (args) => <RevealPhase {...args} />;

export const NotActive = Template.bind({});
NotActive.args = {
  active: false,
};

export const Active = Template.bind({});
Active.args = {
  active: true,
};
