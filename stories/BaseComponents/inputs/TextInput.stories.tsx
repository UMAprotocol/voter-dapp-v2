import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { TextInput } from "components";

export default {
  title: "Base components/Inputs/Text Input",
  component: TextInput,
} as ComponentMeta<typeof TextInput>;

const Template: ComponentStory<typeof TextInput> = (args) => {
  const [_args, updateArgs] = useArgs();

  return <TextInput {...args} onInput={(value) => updateArgs({ value })} />;
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  placeholder: "Custom placeholder text",
};

export const WithTypeText = Template.bind({});
WithTypeText.args = {
  type: "text",
};

export const WithTypeNumber = Template.bind({});
WithTypeNumber.args = {
  type: "number",
};

export const WithTypeNumberNoNegative = Template.bind({});
WithTypeNumberNoNegative.args = {
  type: "number",
  allowNegative: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
