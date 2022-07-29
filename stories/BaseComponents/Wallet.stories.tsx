import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Wallet } from "components/Wallet";

export default {
  title: "Base Components/Wallet",
  component: Wallet,
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof Wallet>;

const Template: ComponentStory<typeof Wallet> = () => <Wallet />;

export const Default = Template.bind({});
