import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AmountInput } from "components";

export default {
  title: "Base components",
  component: AmountInput,
} as ComponentMeta<typeof AmountInput>;

const Template: ComponentStory<typeof AmountInput> = (args) => {
  const [_args, updateArgs] = useArgs();

  return (
    <AmountInput
      {...args}
      onChange={(e) => updateArgs({ value: e.target.value })}
      onMax={() => updateArgs({ value: 10000 })}
    />
  );
};

export const Default = Template.bind({});

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  placeholder: "Custom placeholder text",
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
