import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Toggle } from "components/Toggle";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Base Components/Toggle",
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
