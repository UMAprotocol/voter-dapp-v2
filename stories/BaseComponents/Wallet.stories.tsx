import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Wallet } from "components";

export default {
  title: "Base components",
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
