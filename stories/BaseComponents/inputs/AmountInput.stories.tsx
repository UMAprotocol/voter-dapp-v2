import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AmountInput } from "components";

export default {
  title: "Base components/Inputs/Amount Input",
  component: AmountInput,
} as ComponentMeta<typeof AmountInput>;

const Template: ComponentStory<typeof AmountInput> = (args) => {
  const [_args, updateArgs] = useArgs();

  return (
    <AmountInput
      {...args}
      onInput={(value) => updateArgs({ value })}
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
