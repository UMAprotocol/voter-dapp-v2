import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Nav } from "components/Header/Nav";

export default {
  title: "Nav",
  component: Nav,
} as ComponentMeta<typeof Nav>;

const Template: ComponentStory<typeof Nav> = () => <Nav />;

export const Normal = Template.bind({});
