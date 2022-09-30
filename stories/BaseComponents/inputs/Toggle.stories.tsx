import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Toggle } from "components";

export default {
  title: "Base components/Inputs/Toggle",
  component: Toggle,
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof Toggle>;

const Template: ComponentStory<typeof Toggle> = (args) => {
  const [_args, updateArgs] = useArgs();

  return <Toggle {...args} onClick={() => updateArgs({ clicked: !args.clicked })} />;
};

export const NotClicked = Template.bind({});
NotClicked.args = {
  clicked: false,
};

export const Clicked = Template.bind({});
Clicked.args = {
  clicked: true,
};
