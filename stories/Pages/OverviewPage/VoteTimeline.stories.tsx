import { ComponentStory, ComponentMeta } from "@storybook/react";
import { VoteTimeline } from "components/VoteTimeline";
import add from "date-fns/add";

export default {
  title: "Pages/Overview Page/VoteTimeline",
  component: VoteTimeline,
} as ComponentMeta<typeof VoteTimeline>;

const Template: ComponentStory<typeof VoteTimeline> = (args) => <VoteTimeline {...args} />;

export const NothingHappening = Template.bind({});
NothingHappening.args = {
  phase: null,
  commitPhaseStart: null,
  commitPhaseEnd: null,
  revealPhaseStart: null,
  revealPhaseEnd: null,
};

export const UpcomingVote = Template.bind({});
UpcomingVote.args = {
  phase: null,
  commitPhaseStart: add(new Date(), { hours: 1, minutes: 10 }),
  commitPhaseEnd: null,
  revealPhaseStart: add(new Date(), { hours: 25, minutes: 10 }),
  revealPhaseEnd: null,
};

export const CommitPhase = Template.bind({});
CommitPhase.args = {
  phase: "commit",
  commitPhaseStart: null,
  commitPhaseEnd: add(new Date(), { hours: 23, minutes: 59 }),
  revealPhaseStart: add(new Date(), { hours: 47, minutes: 59 }),
  revealPhaseEnd: null,
};
export const RevealPhase = Template.bind({});
RevealPhase.args = {
  phase: "reveal",
  commitPhaseStart: null,
  commitPhaseEnd: null,
  revealPhaseStart: null,
  revealPhaseEnd: add(new Date(), { hours: 23, minutes: 59 }),
};
