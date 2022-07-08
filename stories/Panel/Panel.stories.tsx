import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel, ClaimPanel, VotePanel } from "components/Panel";

export default {
  title: "Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => <Panel {...args} />;

export const AsClaimPanel = Template.bind({});
AsClaimPanel.args = {
  PanelComponent: ClaimPanel,
  isOpen: true,
  onDismiss: () => {},
};

export const AsVotePanel = Template.bind({});
AsVotePanel.args = {
  PanelComponent: VotePanel,
  isOpen: true,
  onDismiss: () => {},
};
