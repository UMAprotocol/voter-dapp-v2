import { useArgs } from "@storybook/client-api";
import { ComponentMeta, ComponentStory, DecoratorFn } from "@storybook/react";
import { Button } from "components/Button";
import { Panel } from "components/Panel";
import { defaultErrorContextState, ErrorContext } from "contexts/ErrorContext";
import { PanelContext } from "contexts/PanelContext";
import sub from "date-fns/sub";

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

const withErrorDecorator: DecoratorFn = (Story) => {
  const mockErrorContextState = {
    ...defaultErrorContextState,
    errorMessages: ["Something went wrong"],
  };
  return (
    <ErrorContext.Provider value={mockErrorContextState}>
      <Story />
    </ErrorContext.Provider>
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
  panelOpen: true,
};

export const ClaimPanelWithError = Template.bind({});
ClaimPanelWithError.args = {
  ...ClaimPanel.args,
};
ClaimPanelWithError.decorators = [withErrorDecorator];

export const VotePanelWithoutResults = Template.bind({});
VotePanelWithoutResults.args = {
  panelType: "vote",
  panelContent: {
    title: "George Kambosos Jr. vs. Devin Haney",
    description: ` 'Elvis' is a 2022 biographical musical drama film directed by Baz Luhrmann chronicling the life and career of singer and actor Elvis Presley, from his early days as a child to becoming a rock and roll star and movie star, as well as his complex relationship with his manager Colonel Tom Parker. It premiered at several festivals and is scheduled to be theatrically released by Warner Bros. Pictures in the United States on June 24, 2022. 

    This is a market on how much 'Elvis' will gross domestically on its opening weekend. The “Domestic Weekend” tab on https://www.boxofficemojo.com/title/tt3704428/ will be used to resolve this market once the values for the opening weekend (June 24-26) are final (i.e. not studio estimates).
    
    This market will resolve to "Yes" if 'Elvis' grosses more than $45,000,000 on its opening weekend. Otherwise, this market will resolve to "No".
    
    Opening weekend is defined as the first Friday, Saturday, and Sunday of this film's release. Please note, this market will resolve according to the Box Office Mojo number under Domestic Weekend for the 3-day weekend.
    
    If there is no final data available by July 3, 2022, 11:59:59 PM ET, another credible resolution source will be chosen.
     res_data: p1: 0, p2: 1, p3: 0.5, p4: -57896044618658097711785492504343953926634992332820282019728.792003956564819968.
        Where p1 corresponds to No, p2 to a Yes, p3 to unknown, and p4 to an early request,ooRequester:cb1822859cef82cd2eb4e6276c7916e692995130,childRequester:bb1a8db2d4350976a11cdfa60a1d43f97710da49,childChainId:137`,
    decodedAncillaryData: "test test test test",
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

export const VotePanelWithoutResultsWithError = Template.bind({});
VotePanelWithoutResultsWithError.args = {
  ...VotePanelWithoutResults.args,
};
VotePanelWithoutResultsWithError.decorators = [withErrorDecorator];

export const VotePanelWithResultsWithError = Template.bind({});
VotePanelWithResultsWithError.args = {
  ...VotePanelWithResults.args,
};
VotePanelWithResultsWithError.decorators = [withErrorDecorator];

export const StakePanel = Template.bind({});
StakePanel.args = {
  panelType: "stake",
  panelOpen: true,
};

export const StakePanelWithError = Template.bind({});
StakePanelWithError.args = {
  ...StakePanel.args,
};
StakePanelWithError.decorators = [withErrorDecorator];

export const RemindPanel = Template.bind({});
RemindPanel.args = {
  panelType: "remind",
  panelOpen: true,
};
