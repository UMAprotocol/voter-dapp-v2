import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Nav } from "components/Nav";

export default {
  title: "Nav",
  component: Nav,
} as ComponentMeta<typeof Nav>;

const Template: ComponentStory<typeof Nav> = (args) => <Nav {...args} />;
