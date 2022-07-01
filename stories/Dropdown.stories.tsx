import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Dropdown } from "components/Dropdown";

export default {
  title: "Dropdown",
  component: Dropdown,
} as ComponentMeta<typeof Dropdown>;

const Template: ComponentStory<typeof Dropdown> = (args) => <Dropdown {...args} />;

export const Default = Template.bind({});
const defaultMockItems = [
  { label: "Item 1", value: "item-1", secondaryLabel: "Item 1 secondary label" },
  { label: "Item 2", value: "item-2", secondaryLabel: "Item 2 secondary label" },
  { label: "Item 3", value: "item-3", secondaryLabel: "Item 3 secondary label" },
  { label: "Item 4", value: "item-4", secondaryLabel: "Item 4 secondary label" },
];
Default.args = {
  items: defaultMockItems,
  selected: defaultMockItems[0],
  onSelect: (item) => {
    console.log(`Selected ${item.label}`);
  },
};
