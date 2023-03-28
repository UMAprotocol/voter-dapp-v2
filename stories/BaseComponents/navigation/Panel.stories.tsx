import { Decorator, Meta, StoryObj } from "@storybook/react";
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
import { bigNumberFromFloatString, zeroAddress } from "helpers";
import { useState } from "react";
import {
  mockAddress1,
  mockAddress2,
  mockDelegateRequestTransaction,
} from "stories/mocks/delegation";
import { mockWalletIcon } from "stories/mocks/mockWalletIcon";
import { defaultMockVote, makeMockVotesWithHistory } from "stories/mocks/votes";
import { DelegationEventT, DelegationStatusT, VoteT } from "types";

interface Props
  extends PanelContextState,
    ErrorContextState,
    VotesContextState,
    UserContextState,
    DelegationContextState {
  panelType: PanelContextState["panelType"];
  panelContent: PanelContextState["panelContent"];
  votes: VoteT[];
  delegationStatus: DelegationStatusT;
  delegateAddress: string;
  delegatorAddress: string;
  pendingSentRequestsToBeDelegate: DelegationEventT[];
  pendingReceivedRequestsToBeDelegate: DelegationEventT[];
}

const meta: Meta<Props> = {
  component: Panel,
  title: "Base components/Navigation/Panel",
};

export default meta;

type Story = StoryObj<Props>;

function Wrapper({ panelType, panelContent }: Props) {
  const [panelOpen, setPanelOpen] = useState(true);

  function openPanel() {
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
  }

  const mockPanelContextState = {
    ...defaultPanelContextState,
    panelType: panelType ?? defaultPanelContextState.panelType,
    panelOpen: panelOpen ?? true,
    panelContent: panelContent ?? defaultPanelContextState.panelContent,
    openPanel,
    closePanel,
  };

  return (
    <PanelContext.Provider value={mockPanelContextState}>
      <Button variant="primary" onClick={openPanel} label="Open panel" />
      <Panel />
    </PanelContext.Provider>
  );
}

const Template: Story = {
  render: (args) => <Wrapper {...args} />,
};

const errorDecorator: Decorator<Props> = (Story, { args }) => {
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

const mockConnectedWallet = {
  label: "MetaMask",
  icon: mockWalletIcon,
  accounts: [],
  chains: [],
};

const userDecorator: Decorator<Props> = (Story, { args }) => {
  const mockUserContextState: UserContextState = {
    ...defaultUserContextState,
    apr: args.apr ?? BigNumber.from(0),
    cumulativeCalculatedSlash:
      args.cumulativeCalculatedSlash ?? BigNumber.from(0),
    cumulativeCalculatedSlashPercentage:
      args.cumulativeCalculatedSlashPercentage ?? BigNumber.from(0),
    userDataFetching: args.userDataFetching ?? false,
    address: args.address ?? mockAddress1,
    walletIcon: args.walletIcon ?? mockWalletIcon,
    connectedWallet: args.connectedWallet,
  };

  return (
    <UserContext.Provider value={mockUserContextState}>
      <Story />
    </UserContext.Provider>
  );
};

const votesDecorator: Decorator<Props> = (Story, { args }) => {
  const mockVotesContextState: VotesContextState = {
    ...defaultVotesContextState,
    pastVotesList: args.votes ?? [],
  };

  return (
    <VotesContext.Provider value={mockVotesContextState}>
      <Story />
    </VotesContext.Provider>
  );
};

const delegationDecorator: Decorator<Props> = (Story, { args }) => {
  const mockDelegationContextState: DelegationContextState = {
    ...defaultDelegationContextState,
    getDelegationStatus: () => args.delegationStatus ?? "no-delegation",
    getPendingSentRequestsToBeDelegate: () =>
      args.pendingSentRequestsToBeDelegate ?? [],
    getPendingReceivedRequestsToBeDelegate: () =>
      args.pendingReceivedRequestsToBeDelegate ?? [],
    getDelegateAddress: () => args.delegateAddress ?? zeroAddress,
    getDelegatorAddress: () => args.delegatorAddress ?? zeroAddress,
  };

  return (
    <DelegationContext.Provider value={mockDelegationContextState}>
      <Story />
    </DelegationContext.Provider>
  );
};

export const MenuPanelNoWalletConnected: Story = {
  ...Template,
  args: {
    panelType: "menu",
    panelOpen: true,
    address: "",
    connectedWallet: undefined,
    walletIcon: undefined,
    delegationStatus: "no-wallet-connected",
  },
  decorators: [errorDecorator, userDecorator],
};

export const MenuPanelNoDelegation: Story = {
  ...Template,
  args: {
    panelType: "menu",
    panelOpen: true,
    address: mockAddress1,
    // @ts-expect-error - no need to do a complicated mock for the provider here
    connectedWallet: mockConnectedWallet,
    delegationStatus: "no-delegation",
  },
  decorators: [userDecorator, delegationDecorator],
};

export const MenuPanelDelegator: Story = {
  ...Template,
  args: {
    panelType: "menu",
    panelOpen: true,
    address: mockAddress1,
    // @ts-expect-error - no need to do a complicated mock for the provider here
    connectedWallet: mockConnectedWallet,
    delegationStatus: "delegator",
    delegateAddress: mockAddress2,
  },
  decorators: [userDecorator, delegationDecorator],
};

export const MenuPanelDelegate: Story = {
  ...Template,
  args: {
    panelType: "menu",
    panelOpen: true,
    address: mockAddress2,
    // @ts-expect-error - no need to do a complicated mock for the provider here
    connectedWallet: mockConnectedWallet,
    delegationStatus: "delegate",
    delegatorAddress: mockAddress1,
  },
  decorators: [userDecorator, delegationDecorator],
};

export const MenuPanelDelegatorPending: Story = {
  ...Template,
  args: {
    panelType: "menu",
    panelOpen: true,
    address: mockAddress1,
    // @ts-expect-error - no need to do a complicated mock for the provider here
    connectedWallet: mockConnectedWallet,
    delegationStatus: "delegator-pending",
    pendingSentRequestsToBeDelegate: [
      {
        delegator: mockAddress1,
        delegate: mockAddress2,
        transactionHash: mockDelegateRequestTransaction,
      },
    ],
  },
  decorators: [userDecorator, delegationDecorator],
};

export const MenuPanelDelegatePending: Story = {
  ...Template,
  args: {
    panelType: "menu",
    panelOpen: true,
    address: mockAddress2,
    // @ts-expect-error - no need to do a complicated mock for the provider here
    connectedWallet: mockConnectedWallet,
    delegationStatus: "delegate-pending",
    pendingReceivedRequestsToBeDelegate: [
      {
        delegator: mockAddress1,
        delegate: mockAddress2,
        transactionHash: mockDelegateRequestTransaction,
      },
    ],
  },
  decorators: [userDecorator, delegationDecorator],
};

export const ClaimPanel: Story = {
  ...Template,
  args: {
    panelType: "claim",
    panelOpen: true,
  },
};

export const ClaimPanelWithError: Story = {
  ...Template,
  args: {
    ...ClaimPanel.args,
  },
  decorators: [errorDecorator],
};

export const VotePanelWithoutResults: Story = {
  ...Template,
  args: {
    panelType: "vote",
    panelContent: defaultMockVote(),
    panelOpen: true,
  },
};

export const VotePanelWithResults: Story = {
  ...Template,
  args: {
    ...VotePanelWithoutResults.args,
    panelContent: {
      ...defaultMockVote(),
      participation: {
        uniqueCommitAddresses: 100,
        uniqueRevealAddresses: 100,
        totalTokensVotedWith: 800000000.123,
      },
      results: [
        {
          vote: "50000000000",
          tokensVotedWith: 1234,
        },
        {
          vote: "20",
          tokensVotedWith: 5678,
        },
        {
          vote: "10",
          tokensVotedWith: 500,
        },
        {
          vote: "2",
          tokensVotedWith: 199,
        },
      ],
    },
  },
};

export const VotePanelWithLongTitle: Story = {
  ...Template,
  args: {
    ...VotePanelWithoutResults.args,
    panelContent: {
      ...defaultMockVote(),
      title:
        "Will Coinbase support Polygon USDC deposits & withdrawals by June 30, 2022?",
    },
  },
};

export const VotePanelWithoutResultsWithError: Story = {
  ...Template,
  args: {
    ...VotePanelWithoutResults.args,
  },
  decorators: [errorDecorator],
};

export const VotePanelWithResultsWithError: Story = {
  ...Template,
  args: {
    ...VotePanelWithResults.args,
  },
  decorators: [errorDecorator],
};

export const StakePanel: Story = {
  ...Template,
  args: {
    panelType: "stake",
    panelOpen: true,
  },
};

export const StakePanelWithError: Story = {
  ...Template,
  args: {
    ...StakePanel.args,
  },
  decorators: [errorDecorator],
};

export const RemindPanel: Story = {
  ...Template,
  args: {
    panelType: "remind",
    panelOpen: true,
  },
};

export const HistoryPanel: Story = {
  ...Template,
  args: {
    panelType: "history",
    apr: bigNumberFromFloatString(`${Math.random() * 100}`),
    cumulativeCalculatedSlash: bigNumberFromFloatString(
      `${Math.random() * 100}`
    ),
    cumulativeCalculatedSlashPercentage: bigNumberFromFloatString(
      `${Math.random() > 0.5 ? "-" : ""}${Math.random() * 100}`
    ),
    votes: makeMockVotesWithHistory(),
  },
  decorators: [userDecorator, votesDecorator],
};

const delegationPanelDecorators = [userDecorator, delegationDecorator];

const delegationPanelCommonArgs = {
  panelType: "delegation" as const,
  panelOpen: true,
};
export const DelegationPanel: Story = {
  ...Template,
  args: {
    ...delegationPanelCommonArgs,
  },
  decorators: delegationPanelDecorators,
};

// this should render as nothing in the panel because we don't allow the user to open this panel when no wallet is connected
export const DelegationPanelWhenNoWalletConnected: Story = {
  ...Template,
  args: {
    ...delegationPanelCommonArgs,
    delegationStatus: "no-wallet-connected",
  },
  decorators: delegationPanelDecorators,
};

// this should render nothing in the panel because we don't allow a delegate to add a delegate
export const DelegationPanelWhenStatusIsDelegate: Story = {
  ...Template,
  args: {
    ...delegationPanelCommonArgs,
    delegationStatus: "delegate",
  },
  decorators: delegationPanelDecorators,
};

// this should render nothing in the panel because the user must ignore pending delegate requests before attempting to add their own delegate
export const DelegationPanelWhenStatusIsDelegatePending: Story = {
  ...Template,
  args: {
    ...delegationPanelCommonArgs,
    delegationStatus: "delegate-pending",
  },
  decorators: delegationPanelDecorators,
};

// this should render nothing in the panel because we don't allow a delegator to add another delegate
export const DelegationPanelWhenStatusIsDelegator: Story = {
  ...Template,
  args: {
    ...delegationPanelCommonArgs,
    delegationStatus: "delegator",
  },
  decorators: delegationPanelDecorators,
};

export const DelegationPanelWhenStatusIsNoDelegation: Story = {
  ...Template,
  args: {
    ...delegationPanelCommonArgs,
    delegationStatus: "no-delegation",
  },
  decorators: delegationPanelDecorators,
};

export const DelegationPanelWhenStatusIsDelegatorPending: Story = {
  ...Template,
  args: {
    ...delegationPanelCommonArgs,
    delegationStatus: "delegator-pending",
    pendingSentRequestsToBeDelegate: [
      {
        delegator: mockAddress1,
        delegate: mockAddress2,
        transactionHash: mockDelegateRequestTransaction,
      },
    ],
  },
  decorators: delegationPanelDecorators,
};
