import { ComponentMeta, ComponentStory } from "@storybook/react";
import { CooldownTimer } from "components";
import { red500 } from "constant/styles/colors";
import add from "date-fns/add";
import { BigNumber } from "ethers";

export default {
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
} as ComponentMeta<typeof CooldownTimer>;

const Template: ComponentStory<typeof CooldownTimer> = (args) => <CooldownTimer {...args} />;

export const InCooldown = Template.bind({});
InCooldown.args = {
  cooldownEnds: add(new Date(), { hours: 1, minutes: 10 }),
  pendingUnstake: BigNumber.from(100),
  canClaim: false,
  onClaim: () => alert("Yay rewards!"),
};

export const ReadyToClaim = Template.bind({});
ReadyToClaim.args = {
  cooldownEnds: null,
  pendingUnstake: BigNumber.from(100),
  canClaim: true,
  onClaim: () => alert("Yay rewards!"),
};
