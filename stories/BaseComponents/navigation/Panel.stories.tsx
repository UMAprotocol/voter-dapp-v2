import { useArgs } from "@storybook/client-api";
import { DecoratorFn, Meta, Story } from "@storybook/react";
import { Button, Panel } from "components";
import {
  defaultErrorContextState,
  defaultPanelContextState,
  defaultUserContextState,
  defaultVotesContextState,
  ErrorContext,
  ErrorContextState,
  PanelContext,
  PanelContextState,
  UserContext,
  UserContextState,
  VotesContext,
  VotesContextState,
} from "contexts";
import { BigNumber } from "ethers";
import { makeMockVotesWithHistory, voteCommitted } from "stories/mocks/votes";
import { VoteT } from "types";

interface StoryProps extends PanelContextState, ErrorContextState, VotesContextState, UserContextState {
  votes: VoteT[];
}

export default {
  title: "Base components/Navigation/Panel",
  component: Panel,
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
  const [_args, updateArgs] = useArgs();
  const openPanel = () => {
    updateArgs({ ...args, panelOpen: true });
  };
  const closePanel = () => {
    updateArgs({ ...args, panelOpen: false });
  };
  const mockPanelContextState = {
    ...defaultPanelContextState,
    panelType: args.panelType ?? defaultPanelContextState.panelType,
    panelOpen: args.panelOpen ?? defaultPanelContextState.panelOpen,
    panelContent: args.panelContent ?? defaultPanelContextState.panelContent,
    openPanel,
    closePanel,
  };

  return (
    <PanelContext.Provider value={mockPanelContextState}>
      <Button variant="primary" onClick={openPanel} label="Open panel" />
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

const withUserDecorator: DecoratorFn = (Story, { args }) => {
  const mockUserContextState = {
    ...defaultUserContextState,
    apr: args.apr ?? 0,
    cumulativeCalculatedSlash: args.cumulativeCalculatedSlash ?? BigNumber.from(0),
    cumulativeCalculatedSlashPercentage: args.cumulativeCalculatedSlashPercentage ?? BigNumber.from(0),
    userDataFetching: args.userDataFetching ?? false,
  };

  return (
    <UserContext.Provider value={mockUserContextState}>
      <Story />
    </UserContext.Provider>
  );
};

const withVotesDecorator: DecoratorFn = (Story, { args }) => {
  const mockVotesContextState = {
    ...defaultVotesContextState,
    getPastVotes: () => args.votes ?? [],
  };

  return (
    <VotesContext.Provider value={mockVotesContextState}>
      <Story />
    </VotesContext.Provider>
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
  panelContent: voteCommitted,
  panelOpen: true,
};

export const VotePanelWithResults = Template.bind({});
VotePanelWithResults.args = {
  ...VotePanelWithoutResults.args,
  panelContent: {
    ...voteCommitted,
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
    ...voteCommitted,
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

export const HistoryPanel = Template.bind({});
HistoryPanel.decorators = [withUserDecorator, withVotesDecorator];
HistoryPanel.args = {
  panelType: "history",
  apr: BigNumber.from(10),
  cumulativeCalculatedSlash: BigNumber.from(100),
  cumulativeCalculatedSlashPercentage: BigNumber.from(100),
  votes: makeMockVotesWithHistory(),
};
