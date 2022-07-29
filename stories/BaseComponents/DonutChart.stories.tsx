import { ComponentMeta, ComponentStory } from "@storybook/react";
import { DonutChart } from "components/DonutChart";

export default {
  title: "Base Components/DonutChart",
  component: DonutChart,
} as ComponentMeta<typeof DonutChart>;

const Template: ComponentStory<typeof DonutChart> = (args) => <DonutChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      value: 0.5,
      label: "first",
      color: "red",
    },
    {
      value: 0.5,
      label: "second",
      color: "blue",
    },
  ],
};
