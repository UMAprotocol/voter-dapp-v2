import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel } from "components/Panel";

export default {
  title: "Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => <Panel {...args} />;

export const AsClaimPanel = Template.bind({});
AsClaimPanel.args = {
  panelType: "claim",
  isOpen: true,
  onDismiss: () => {},
};

export const AsVotePanel = Template.bind({});
AsVotePanel.args = {
  panelType: "vote",
  isOpen: true,
  onDismiss: () => {},
};
