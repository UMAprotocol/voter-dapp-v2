import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel } from "components/Panel";
import { Button } from "components/Button";
import { PanelContext } from "contexts/PanelContext";
import { useArgs } from "@storybook/client-api";
import sub from "date-fns/sub";
import { DisputeOrigins } from "types/global";

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
    panelContent: args?.panelContent ?? null,
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
    title: "George Kambosos Jr. vs. Devin Haney",
    description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 

    The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
    If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
    origin: DisputeOrigins.Polymarket,
    options: [" Devin Haney", "George Kambosos Jr.", "Tie"],
    timestamp: sub(new Date(), { days: 1 }),
    links: [
      {
        label: "UMIP link",
        href: "https://www.todo.com",
      },
      {
        label: "Dispute txid",
        href: "https://www.todo.com",
      },
      {
        label: "Optimistic Oracle UI",
        href: "https://www.todo.com",
      },
    ],
    discordLink: "https://www.todo.com",
  },
  panelOpen: true,
};

export const AsStakePanel = Template.bind({});
AsStakePanel.args = {
  panelType: "stake",
  panelOpen: true,
};
