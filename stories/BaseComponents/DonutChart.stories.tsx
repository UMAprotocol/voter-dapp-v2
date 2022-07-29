import { ComponentMeta, ComponentStory } from "@storybook/react";
import { DonutChart } from "components/DonutChart";

export default {
  title: "Base Components/DonutChart",
  component: DonutChart,
} as ComponentMeta<typeof DonutChart>;

const Template: ComponentStory<typeof DonutChart> = (args) => <DonutChart {...args} />;

const length = 8;
const segments = Array.from({ length }).map((_, i) => ({ label: `Segment ${i + 1}`, value: 1 / length }));

export const Default = Template.bind({});
Default.args = {
  segments,
};

export const CustomSize = Template.bind({});
CustomSize.args = {
  segments,
  size: 400,
};

export const CustomHole = Template.bind({});
CustomHole.args = {
  segments,
  hole: 180,
};

export const CustomGap = Template.bind({});
CustomGap.args = {
  segments,
  gapSize: 3,
};
