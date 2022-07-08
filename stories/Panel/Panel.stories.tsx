import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel } from "components/Panel";
import { useArgs } from "@storybook/client-api";
import { Button } from "components/Button";

export default {
  title: "Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => {
  const [_args, updateArgs] = useArgs();

  return (
    <div>
      <Button variant="primary" onClick={() => updateArgs({ isOpen: true })} label="Open panel" />
      <Panel {...args} onDismiss={() => updateArgs({ isOpen: false })} />
    </div>
  );
};

export const AsClaimPanel = Template.bind({});
AsClaimPanel.args = {
  panelType: "claim",
  isOpen: true,
};

export const AsVotePanel = Template.bind({});
AsVotePanel.args = {
  panelType: "vote",
  isOpen: true,
};
