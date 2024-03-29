import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Checkbox } from "components";

export default {
  title: "Base components/Inputs/Checkbox",
  component: Checkbox,
  decorators: [
    (Story) => (
      <div style={{ width: 500 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof Checkbox>;

const Template: ComponentStory<typeof Checkbox> = (args) => {
  const [_args, updateArgs] = useArgs();

  return (
    <Checkbox
      {...args}
      onChange={(e) => updateArgs({ checked: e.target.checked })}
    />
  );
};

export const Unchecked = Template.bind({});
Unchecked.args = {
  checked: false,
  label: "Unchecked",
};
export const Checked = Template.bind({});
Checked.args = {
  checked: true,
  label: "Checked",
};
