import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button } from "components/Button";

export default {
  title: "Button",
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const AsButtonPrimary = Template.bind({});
AsButtonPrimary.args = {
  variant: "primary",
  label: "Button",
  onClick: () => console.log("Button clicked"),
  href: undefined,
};
export const AsButtonPrimaryHover = Template.bind({});
AsButtonPrimaryHover.args = {
  variant: "primary",
  label: "Button",
  onClick: () => console.log("Button clicked"),
  href: undefined,
};
AsButtonPrimaryHover.parameters = {
  pseudo: {
    hover: true,
  },
};
export const AsButtonPrimaryDisabled = Template.bind({});
AsButtonPrimaryDisabled.args = {
  variant: "primary",
  label: "Button",
  onClick: () => console.log("Button clicked"),
  href: undefined,
  disabled: true,
};

export const AsLinkPrimary = Template.bind({});
AsLinkPrimary.args = {
  variant: "primary",
  label: "Link",
  href: "https://www.google.com",
  onClick: undefined,
};
export const AsLinkPrimaryHover = Template.bind({});
AsLinkPrimaryHover.args = {
  variant: "primary",
  label: "Link",
  href: "https://www.google.com",
  onClick: undefined,
};
AsLinkPrimaryHover.parameters = {
  pseudo: {
    hover: true,
  },
};

export const AsButtonSecondary = Template.bind({});
AsButtonSecondary.args = {
  ...AsButtonPrimary.args,
  variant: "secondary",
};

export const AsLinkSecondary = Template.bind({});
AsLinkSecondary.args = {
  ...AsLinkPrimary.args,
  variant: "secondary",
};

export const AsButtonTertiary = Template.bind({});
AsButtonTertiary.args = {
  ...AsButtonPrimary.args,
  variant: "tertiary",
};

export const AsLinkTertiary = Template.bind({});
AsLinkTertiary.args = {
  ...AsLinkPrimary.args,
  variant: "tertiary",
};

export const WithCustomWidthPx = Template.bind({});
WithCustomWidthPx.args = {
  ...AsButtonPrimary.args,
  width: 300,
};

export const WithCustomWidthPercent = Template.bind({});
WithCustomWidthPercent.args = {
  ...AsButtonPrimary.args,
  width: "50%",
};

export const WithCustomHeightPx = Template.bind({});
WithCustomHeightPx.args = {
  ...AsButtonPrimary.args,
  height: 30,
};

export const WithCustomHeightPercent = Template.bind({});
WithCustomHeightPercent.args = {
  ...AsButtonPrimary.args,
  height: "50%",
};

export const WithCustomFontSize = Template.bind({});
WithCustomFontSize.args = {
  ...AsButtonPrimary.args,
  fontSize: 12,
};
