import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Banner } from "components";

export default {
  title: "Pages/Vote Page/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

const Template: ComponentStory<typeof Banner> = () => <Banner />;

export const Default = Template.bind({});
