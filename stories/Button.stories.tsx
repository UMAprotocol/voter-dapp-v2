import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button } from "components/Button";

export default {
  title: "Button",
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const AsButton = Template.bind({});
AsButton.args = {
  label: "Button",
  onClick: () => console.log("Button clicked"),
  href: undefined,
};

export const AsButtonPrimary = Template.bind({});
AsButtonPrimary.args = {
  ...AsButton.args,
  variant: "primary",
};

export const AsLink = Template.bind({});
AsLink.args = {
  label: "Link",
  href: "https://www.google.com",
  onClick: undefined,
};

export const AsLinkPrimary = Template.bind({});
AsLinkPrimary.args = {
  ...AsLink.args,
  variant: "primary",
};
