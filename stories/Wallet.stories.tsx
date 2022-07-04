import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Wallet } from "components/Wallet";

export default {
  title: "Wallet",
  component: Wallet,
} as ComponentMeta<typeof Wallet>;

const Template: ComponentStory<typeof Wallet> = () => <Wallet />;

export const Default = Template.bind({});
