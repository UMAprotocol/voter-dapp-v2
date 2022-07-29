import { ComponentMeta, ComponentStory } from "@storybook/react";
import { HowItWorks } from "components/HowItWorks";

export default {
  title: "Pages/Overview Page/HowItWorks",
  component: HowItWorks,
} as ComponentMeta<typeof HowItWorks>;

const Template: ComponentStory<typeof HowItWorks> = () => <HowItWorks />;

export const Default = Template.bind({});
