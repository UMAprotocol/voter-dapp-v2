import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Banner } from "components";

export default {
  title: "Pages/Vote Page/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

const Template: ComponentStory<typeof Banner> = (args) => <Banner {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: "Stake, vote & earn up to 30% APY",
};
