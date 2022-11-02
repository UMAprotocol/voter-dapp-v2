import { ComponentMeta, ComponentStory } from "@storybook/react";
import { LoadingSkeleton } from "components";
import { red500 } from "constant";

export default {
  title: "Base components/Loaders/Loading Skeleton",
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

export const CustomDimensionsNumberInputs = Template.bind({});
CustomDimensionsNumberInputs.argTypes = {
  width: { control: "number" },
  height: { control: "number" },
};
CustomDimensionsNumberInputs.args = {
  width: 100,
  height: 20,
};

export const CustomDimensionsStringInputs = Template.bind({});
CustomDimensionsStringInputs.argTypes = {
  width: { control: "text" },
  height: { control: "text" },
};
CustomDimensionsStringInputs.args = {
  width: "80%",
  height: "5vh",
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
