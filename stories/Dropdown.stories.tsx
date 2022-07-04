import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Dropdown } from "components/Dropdown";
import { useArgs } from "@storybook/client-api";

const defaultMockItems = [
  { label: "Item 1", value: "item-1", secondaryLabel: "Item 1 secondary label" },
  { label: "Item 2", value: "item-2", secondaryLabel: "Item 2 secondary label" },
  { label: "Item 3", value: "item-3", secondaryLabel: "Item 3 secondary label" },
  { label: "Item 4", value: "item-4", secondaryLabel: "Item 4 secondary label" },
];

export default {
  title: "Dropdown",
  component: Dropdown,
  args: {
    label: "Dropdown label",
    selected: null,
    items: defaultMockItems,
  },
} as ComponentMeta<typeof Dropdown>;

const Template: ComponentStory<typeof Dropdown> = (args) => {
  const [_args, updateArgs] = useArgs();

  return (
    <Dropdown
      {...args}
      onSelect={(item) => {
        updateArgs({ selected: item });
      }}
    />
  );
};

export const Default = Template.bind({});
