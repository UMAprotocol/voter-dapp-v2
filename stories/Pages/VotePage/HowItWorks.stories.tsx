import { ComponentMeta, ComponentStory } from "@storybook/react";
import { HowItWorks } from "components/HowItWorks";
import add from "date-fns/add";

export default {
  title: "Pages/Vote Page/HowItWorks",
  component: HowItWorks,
} as ComponentMeta<typeof HowItWorks>;

const Template: ComponentStory<typeof HowItWorks> = (args) => <HowItWorks {...args} />;

export const Default = Template.bind({});
Default.args = {
  votesInLastCycles: 3,
  apy: 18,
};
