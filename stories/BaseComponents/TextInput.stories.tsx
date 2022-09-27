import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { TextInput } from "components";

export default {
  title: "Base components",
  component: TextInput,
} as ComponentMeta<typeof TextInput>;

const Template: ComponentStory<typeof TextInput> = (args) => {
  const [_args, updateArgs] = useArgs();

  return <TextInput {...args} onChange={(e) => updateArgs({ value: e.target.value })} />;
};

export const Default = Template.bind({});

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  placeholder: "Custom placeholder text",
};

export const WithTypeEmail = Template.bind({});
WithTypeEmail.args = {
  type: "email",
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
