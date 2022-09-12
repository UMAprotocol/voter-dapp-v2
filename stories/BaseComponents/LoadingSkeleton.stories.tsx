import { ComponentMeta, ComponentStory } from "@storybook/react";
import { LoadingSkeleton } from "components/LoadingSkeleton";
import { red500 } from "constants/colors";

export default {
  title: "Base Components/LoadingSkeleton",
  component: LoadingSkeleton,
  decorators: [
    (Story) => (
      <div style={{ width: 200, height: 40 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof LoadingSkeleton>;

const Template: ComponentStory<typeof LoadingSkeleton> = (args) => <LoadingSkeleton {...args} />;

export const Default = Template.bind({});

export const CustomDimensions = Template.bind({});
CustomDimensions.args = {
  width: 100,
  height: 20,
};

export const WhiteVariant = Template.bind({});
WhiteVariant.args = {
  variant: "white",
};
WhiteVariant.decorators = [
  (Story) => (
    <div style={{ width: 200, height: 40, background: red500, display: "grid", placeItems: "center" }}>
      <Story />
    </div>
  ),
];
