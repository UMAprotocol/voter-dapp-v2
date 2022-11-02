import { ComponentMeta, ComponentStory } from "@storybook/react";
import { InfoBar } from "components";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";

export default {
  title: "Pages/Vote Page/InfoBar",
  component: InfoBar,
} as ComponentMeta<typeof InfoBar>;

const Template: ComponentStory<typeof InfoBar> = (args) => (
  <InfoBar {...args} />
);

export const WithButton = Template.bind({});
WithButton.args = {
  label: (
    <>
      <Three />
      Get rewards
    </>
  ),
  content: (
    <>
      You have <strong>92,726 UMA</strong> in unclaimed rewards
    </>
  ),
  actionLabel: "Claim",
  onClick: () => console.log("Yay rewards!"),
  href: undefined,
};

export const WithLink = Template.bind({});
WithLink.args = {
  label: (
    <>
      <One />
      Stake UMA
    </>
  ),
  content: (
    <>
      You are staking <strong>34.567.890</strong> UMA tokens of 54.321.098
    </>
  ),
  actionLabel: "Stake/Unstake",
  onClick: undefined,
  href: "https://www.google.com",
};
