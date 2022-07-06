import { ComponentMeta, ComponentStory } from "@storybook/react";
import OverviewPage from "pages";

export default {
  title: "OverviewPage",
  component: OverviewPage,
} as ComponentMeta<typeof OverviewPage>;

const Template: ComponentStory<typeof OverviewPage> = () => <OverviewPage />;

export const Default = Template.bind({});
