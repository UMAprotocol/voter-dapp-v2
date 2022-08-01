import { ComponentMeta, ComponentStory } from "@storybook/react";
import { HowItWorks } from "components/HowItWorks";
import add from "date-fns/add";

export default {
  title: "Pages/Overview Page/HowItWorks",
  component: HowItWorks,
} as ComponentMeta<typeof HowItWorks>;

const Template: ComponentStory<typeof HowItWorks> = (args) => <HowItWorks {...args} />;

export const Default = Template.bind({});
Default.args = {
  stakedBalance: 123.456,
  unstakedBalance: 123.456,
  claimableRewards: 123.456,
  cooldownEnds: add(new Date(), { days: 1 }),
  votesInLastCycles: 3,
  apy: 18,
};
