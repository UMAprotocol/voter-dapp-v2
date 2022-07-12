import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel } from "components/Panel";
import { Button } from "components/Button";
import { PanelContext } from "contexts/PanelContext";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Panel",
  component: Panel,
} as ComponentMeta<typeof Panel>;

const Template: ComponentStory<typeof Panel> = (args) => {
  const [_args, updateArgs] = useArgs();
  const mockPanelContextState = {
    // @ts-expect-error - ignore ts error args is of type unknown
    panelType: args.panelType,
    setPanelType: () => null,
    // @ts-expect-error - ignore ts error args is of type unknown
    panelContent: args.panelContent,
    setPanelContent: () => null,
    // @ts-expect-error - ignore ts error args is of type unknown
    panelOpen: args.panelOpen,
    // @ts-expect-error - ignore ts error args is of type unknown
    setPanelOpen: () => updateArgs({ panelOpen: !args.panelOpen }),
  };
  function handleClose() {
    // @ts-expect-error - ignore ts error args is of type unknown
    updateArgs({ panelOpen: !args.panelOpen });
  }
  return (
    <PanelContext.Provider value={mockPanelContextState}>
      <Button variant="primary" onClick={handleClose} label="Open panel" />
      <Panel />
    </PanelContext.Provider>
  );
};

export const AsClaimPanel = Template.bind({});
AsClaimPanel.args = {
  panelType: "claim",
  panelContent: {
    title: "Claim",
    description: "Claim description",
  },
  panelOpen: true,
};

export const AsVotePanel = Template.bind({});
AsVotePanel.args = {
  panelType: "vote",
  panelContent: {
    title: "Vote",
    description: "Vote description",
  },
  panelOpen: true,
};

export const AsStakePanel = Template.bind({});
AsStakePanel.args = {
  panelType: "stake",
  panelOpen: true,
};
