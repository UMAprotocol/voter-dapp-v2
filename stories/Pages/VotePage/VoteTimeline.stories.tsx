import { ComponentStory, ComponentMeta } from "@storybook/react";
import { VoteTimeline } from "components/VoteTimeline";
import add from "date-fns/add";

export default {
  title: "Pages/Vote Page/VoteTimeline",
  component: VoteTimeline,
} as ComponentMeta<typeof VoteTimeline>;

const Template: ComponentStory<typeof VoteTimeline> = (args) => <VoteTimeline {...args} />;

export const CommitPhase = Template.bind({});
CommitPhase.args = {
  phase: "commit",
  phaseEnds: add(new Date(), { minutes: 59 }),
};
export const RevealPhase = Template.bind({});
RevealPhase.args = {
  phase: "reveal",
  phaseEnds: add(new Date(), { hours: 23, minutes: 59 }),
};
