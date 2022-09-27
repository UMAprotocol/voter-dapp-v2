import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Dropdown } from "components";
import { blackOpacity25 } from "constants/colors";

const defaultMockItems = [
  { label: "Yes", value: "p0", secondaryLabel: "p0" },
  { label: "No", value: "p1", secondaryLabel: "p1" },
  { label: "Unknown", value: "p2", secondaryLabel: "p2" },
  { label: "Early Request", value: "p3", secondaryLabel: "p3" },
];

export default {
  title: "Base components",
  component: Dropdown,
  args: {
    label: "Select answer",
    selected: null,
    items: defaultMockItems,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
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

export const WithBorderColor = Template.bind({});
WithBorderColor.args = {
  borderColor: blackOpacity25,
};

export const WithDisabled = Template.bind({});
WithDisabled.args = {
  disabled: true,
};
