import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Header } from "components";

export default {
  title: "Base components/Navigation/Header",
  component: Header,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = () => <Header />;

export const NotConnected = Template.bind({});
