import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Dropdown } from "components/Dropdown";
import { useArgs } from "@storybook/client-api";

const defaultMockItems = [
  { label: "Yes", value: "p0", secondaryLabel: "p0" },
  { label: "No", value: "p1", secondaryLabel: "p1" },
  { label: "Unknown", value: "p2", secondaryLabel: "p2" },
  { label: "Early Request", value: "p3", secondaryLabel: "p3" },
];

export default {
  title: "Dropdown",
  component: Dropdown,
  args: {
    label: "Select answer",
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
