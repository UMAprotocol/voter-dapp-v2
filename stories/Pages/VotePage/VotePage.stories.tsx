import { ComponentMeta, ComponentStory } from "@storybook/react";
import VotePage from "pages";

export default {
  title: "Pages/Vote Page/VotePage",
  component: VotePage,
} as ComponentMeta<typeof VotePage>;

const Template: ComponentStory<typeof VotePage> = () => <VotePage />;

export const Default = Template.bind({});
Default.parameters = {
  viewport: {
    defaultViewport: "mobile2",
  },
};
