import { ComponentStory, ComponentMeta } from "@storybook/react";
import { NavLink } from "components/Header/Nav";

export default {
  title: "NavLink",
  component: NavLink,
} as ComponentMeta<typeof NavLink>;

const Template: ComponentStory<typeof NavLink> = (args) => <NavLink {...args} />;

export const Active = Template.bind({});
Active.args = {
  active: true,
  label: "Active",
  href: "https://www.google.com",
};

export const NotActive = Template.bind({});
NotActive.args = {
  active: false,
  label: "Not Active",
  href: "https://www.google.com",
};
