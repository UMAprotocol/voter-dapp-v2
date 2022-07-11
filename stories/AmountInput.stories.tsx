import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AmountInput } from "components/AmountInput";
import { useArgs } from "@storybook/client-api";

export default {
  title: "AmountInput",
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
