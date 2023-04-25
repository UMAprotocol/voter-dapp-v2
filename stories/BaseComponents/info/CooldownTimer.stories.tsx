import { Meta, StoryObj } from "@storybook/react";
import { CooldownTimer } from "components";
import { red500 } from "constant";
import add from "date-fns/add";
import { BigNumber } from "ethers";
import { date } from "stories/mocks/misc";

const meta: Meta = {
  title: "Base components/Info/Cooldown Timer",
  component: CooldownTimer,
  decorators: [
    (Story) => (
      <div
        style={{
          width: 570,
          height: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: red500,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CooldownTimer>;

const Template: Story = {
  render: (args) => <CooldownTimer {...args} />,
};

export const InCooldown: Story = {
  ...Template,
  args: {
    cooldownEnds: add(date, { hours: 1, minutes: 10 }),
    pendingUnstake: BigNumber.from(100),
    isReadyToUnstake: false,
    onExecuteUnstake: () => alert("Yay rewards!"),
  },
};

export const ReadyToUnstake: Story = {
  ...Template,
  args: {
    cooldownEnds: null,
    pendingUnstake: BigNumber.from(100),
    isReadyToUnstake: true,
    onExecuteUnstake: () => alert("Yay rewards!"),
  },
};
