import { useArgs } from "@storybook/client-api";
import { DecoratorFn, Meta, Story } from "@storybook/react";
import { Button, Panel } from "components";
import {
  defaultDelegationContextState,
  defaultErrorContextState,
  defaultPanelContextState,
  defaultUserContextState,
  defaultVotesContextState,
  DelegationContext,
  DelegationContextState,
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
import { bigNumberFromFloatString } from "helpers";
import { makeMockVotesWithHistory, voteCommitted } from "stories/mocks/votes";
import { DelegationEventT, DelegationStatusT, VoteT } from "types";

interface StoryProps
  extends PanelContextState,
    ErrorContextState,
    VotesContextState,
    UserContextState,
    DelegationContextState {
  votes: VoteT[];
  delegationStatus: DelegationStatusT;
  delegateAddress: string;
  pendingSetDelegateRequestsForDelegator: DelegationEventT[];
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
    panelOpen: args.panelOpen ?? true,
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

const withErrorDecorator: DecoratorFn = (Story, { args }) => {
  const mockErrorMessages = {
    claim: ["Something went wrong in claim panel"],
    stake: ["Something went wrong in stake panel"],
    unstake: ["Something went wrong in unstake panel"],
    vote: ["Something went wrong in vote panel"],
    delegation: ["Something went wrong in delegation panel"],
  };
  const mockErrorContextState = {
    ...defaultErrorContextState,
    errorMessages: args.errorMessages ?? mockErrorMessages,
  };
  return (
    <ErrorContext.Provider value={mockErrorContextState}>
      <Story />
    </ErrorContext.Provider>
  );
};

const withUserDecorator: DecoratorFn = (Story, { args }) => {
  const mockUserContextState: UserContextState = {
    ...defaultUserContextState,
    apr: args.apr ?? 0,
    cumulativeCalculatedSlash: args.cumulativeCalculatedSlash ?? BigNumber.from(0),
    cumulativeCalculatedSlashPercentage: args.cumulativeCalculatedSlashPercentage ?? BigNumber.from(0),
    userDataFetching: args.userDataFetching ?? false,
    address: args.address ?? "0x1234567890123456789012345678901234567890",
  };

  return (
    <UserContext.Provider value={mockUserContextState}>
      <Story />
    </UserContext.Provider>
  );
};

const withVotesDecorator: DecoratorFn = (Story, { args }) => {
  const mockVotesContextState: VotesContextState = {
    ...defaultVotesContextState,
    getPastVotes: () => args.votes ?? [],
  };

  return (
    <VotesContext.Provider value={mockVotesContextState}>
      <Story />
    </VotesContext.Provider>
  );
};

const withDelegationDecorator: DecoratorFn = (Story, { args }) => {
  const mockDelegationContextState: DelegationContextState = {
    ...defaultDelegationContextState,
    getDelegationStatus: () => args.delegationStatus ?? "no-delegation",
    getPendingSentRequestsToBeDelegate: () => args.pendingSetDelegateRequestsForDelegator ?? [],
    getDelegateAddress: () => args.delegateAddress ?? "0x1234567890123456789012345678901234567890",
  };

  return (
    <DelegationContext.Provider value={mockDelegationContextState}>
      <Story />
    </DelegationContext.Provider>
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
  apr: bigNumberFromFloatString(`${Math.random() * 100}`),
  cumulativeCalculatedSlash: bigNumberFromFloatString(`${Math.random() * 100}`),
  cumulativeCalculatedSlashPercentage: bigNumberFromFloatString(
    `${Math.random() > 0.5 ? "-" : ""}${Math.random() * 100}`
  ),
  votes: makeMockVotesWithHistory(),
};

const delegationPanelDecorators = [withUserDecorator, withDelegationDecorator];
const delegationPanelCommonArgs = {
  panelType: "delegation" as const,
  panelOpen: true,
};
export const DelegationPanel = Template.bind({});
DelegationPanel.args = {
  ...delegationPanelCommonArgs,
};
DelegationPanel.decorators = delegationPanelDecorators;

// this should render as nothing in the panel because we don't allow the user to open this panel when no wallet is connected
export const DelegationPanelWhenNoWalletConnected = Template.bind({});
DelegationPanelWhenNoWalletConnected.args = {
  ...delegationPanelCommonArgs,
  delegationStatus: "no-wallet-connected",
};
DelegationPanelWhenNoWalletConnected.decorators = delegationPanelDecorators;

// this should render nothing in the panel because we don't allow a delegate to add a delegate
export const DelegationPanelWhenStatusIsDelegate = Template.bind({});
DelegationPanelWhenStatusIsDelegate.args = {
  ...delegationPanelCommonArgs,
  delegationStatus: "delegate",
};
DelegationPanelWhenStatusIsDelegate.decorators = delegationPanelDecorators;

// this should render nothing in the panel because the user must ignore pending delegate requests before attempting to add their own delegate
export const DelegationPanelWhenStatusIsDelegatePending = Template.bind({});
DelegationPanelWhenStatusIsDelegatePending.args = {
  ...delegationPanelCommonArgs,
  delegationStatus: "delegate-pending",
};
DelegationPanelWhenStatusIsDelegatePending.decorators = delegationPanelDecorators;

// this should render nothing in the panel because we don't allow a delegator to add another delegate
export const DelegationPanelWhenStatusIsDelegator = Template.bind({});
DelegationPanelWhenStatusIsDelegator.args = {
  ...delegationPanelCommonArgs,
  delegationStatus: "delegator",
};
DelegationPanelWhenStatusIsDelegator.decorators = delegationPanelDecorators;

export const DelegationPanelWhenStatusIsNoDelegation = Template.bind({});
DelegationPanelWhenStatusIsNoDelegation.args = {
  ...delegationPanelCommonArgs,
  delegationStatus: "no-delegation",
};
DelegationPanelWhenStatusIsNoDelegation.decorators = delegationPanelDecorators;

export const DelegationPanelWhenStatusIsDelegatorPending = Template.bind({});
DelegationPanelWhenStatusIsDelegatorPending.args = {
  ...delegationPanelCommonArgs,
  delegationStatus: "delegator-pending",
  pendingSetDelegateRequestsForDelegator: [
    {
      delegate: "0x0987654321098765432109876543210987654321",
      delegator: "0x1234567890123456789012345678901234567890",
      transactionHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
    },
  ],
};
DelegationPanelWhenStatusIsDelegatorPending.decorators = delegationPanelDecorators;
