import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Panel } from "components/Panel";
import { Button } from "components/Button";
import { PanelContext } from "contexts/PanelContext";
import { useArgs } from "@storybook/client-api";
import sub from "date-fns/sub";
import add from "date-fns/add";

export default {
  title: "Base Components/Panel",
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

export const MenuPanel = Template.bind({});
MenuPanel.args = {
  panelType: "menu",
  panelOpen: true,
};

export const ClaimPanel = Template.bind({});
ClaimPanel.args = {
  panelType: "claim",
  panelContent: {
    claimableRewards: 123.456,
  },
  panelOpen: true,
};

export const VotePanelWithoutResults = Template.bind({});
VotePanelWithoutResults.args = {
  panelType: "vote",
  panelContent: {
    title: "George Kambosos Jr. vs. Devin Haney",
    description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 

    The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
    If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
    origin: "Polymarket",
    voteNumber: 205,
    options: [
      { label: "Devin Haney", value: 0 },
      { label: "George Kambosos Jr.", value: 1 },
      { label: "Tie", value: 3 },
    ],
    timeAsDate: sub(new Date(), { days: 1 }),
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

export const VotePanelWithResults = Template.bind({});
VotePanelWithResults.args = {
  ...VotePanelWithoutResults.args,
  panelContent: {
    // @ts-expect-error - ignore ts error args is of type unknown
    ...VotePanelWithoutResults.args.panelContent,
    participation: [
      { label: "Total Votes", value: 188077355.982231 },
      { label: "Unique Commit Addresses", value: 100 },
      { label: "Unique Reveal Addresses", value: 97 },
    ],
    results: [
      {
        label: "Devin Haney",
        value: 1234,
      },
      {
        label: "George Washington",
        value: 5678,
      },
      {
        label: "Tie",
        value: 500,
      },
      {
        label: "Early Expiry",
        value: 199,
      },
    ],
  },
};

export const VotePanelWithLongTitle = Template.bind({});
VotePanelWithLongTitle.args = {
  ...VotePanelWithoutResults.args,
  panelContent: {
    // @ts-expect-error - ignore ts error args is of type unknown
    ...VotePanelWithoutResults.args.panelContent,
    title: "Will Coinbase support Polygon USDC deposits & withdrawals by June 30, 2022?",
  },
};

export const StakePanel = Template.bind({});
StakePanel.args = {
  panelType: "stake",
  panelOpen: true,
  panelContent: {
    stakedBalance: 123.456,
    unstakedBalance: 123.456,
    claimableRewards: 123.456,
    cooldownEnds: add(new Date(), { days: 1 }),
  },
};

export const RemindPanel = Template.bind({});
RemindPanel.args = {
  panelType: "remind",
  panelOpen: true,
};
