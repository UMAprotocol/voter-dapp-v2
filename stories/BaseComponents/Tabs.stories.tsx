import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Tabs } from "components/Tabs";

export default {
  title: "Base Components/Tabs",
  component: Tabs,
} as ComponentMeta<typeof Tabs>;

const Template: ComponentStory<typeof Tabs> = (args) => <Tabs {...args} />;

const tabs = [
  {
    title: "Stake",
    content: <div>Stake panel</div>,
  },
  {
    title: "Unstake",
    content: <div>Unstake panel</div>,
  },
];

export const Default = Template.bind({});
Default.args = {
  tabs,
};
