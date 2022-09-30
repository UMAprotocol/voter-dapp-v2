import { ComponentMeta, ComponentStory } from "@storybook/react";
import { DonutChart } from "components";

export default {
  title: "Base components/Donut Chart",
  component: DonutChart,
} as ComponentMeta<typeof DonutChart>;

const Template: ComponentStory<typeof DonutChart> = (args) => <DonutChart {...args} />;

const length = 3;
const data = Array.from({ length }).map((_, i) => ({ label: `Segment ${i + 1}`, value: 1 / length }));

export const Default = Template.bind({});
Default.args = {
  data,
};

export const CustomSize = Template.bind({});
CustomSize.args = {
  data,
  size: 400,
};

export const CustomHole = Template.bind({});
CustomHole.args = {
  data,
  hole: 180,
};

export const CustomGap = Template.bind({});
CustomGap.args = {
  data,
  gapSize: 3,
};
