import { ComponentMeta, ComponentStory } from "@storybook/react";
import { LoadingSpinner } from "components/LoadingSpinner";

export default {
  title: "Base Components/LoadingSpinner",
  component: LoadingSpinner,
} as ComponentMeta<typeof LoadingSpinner>;

const Template: ComponentStory<typeof LoadingSpinner> = (args) => <LoadingSpinner {...args} />;

export const Default = Template.bind({});

export const BlackVariant = Template.bind({});
BlackVariant.args = {
  variant: "black",
};

export const CustomSize = Template.bind({});
CustomSize.args = {
  size: 100,
};

export const CustomThickness = Template.bind({});
CustomThickness.args = {
  thickness: 10,
};