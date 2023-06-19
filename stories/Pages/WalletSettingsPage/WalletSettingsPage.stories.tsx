/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Meta, Story } from "@storybook/react";
import {
  defaultDelegationContextState,
  DelegationContext,
  DelegationContextState,
} from "contexts";
import WalletSettingsPage from "pages/wallet-settings";
import {
  mockAddress1,
  mockAddress2,
  mockAddress3,
  mockDelegateRequestTransaction,
} from "stories/mocks/delegation";
import { mockWalletIcon } from "stories/mocks/mockWalletIcon";
import { DelegationEventT, DelegationStatusT } from "types";

interface StoryProps extends DelegationContextState {
  delegationStatus: DelegationStatusT;
  address: string;
  walletIcon: string | undefined;
  pendingReceivedRequestsToBeDelegate: DelegationEventT[];
  hasPendingReceivedRequestsToBeDelegate: boolean;
  pendingSentRequestsToBeDelegate: DelegationEventT[];
  hasPendingSentRequestsToBeDelegate: boolean;
  delegateAddress: string;
  delegatorAddress: string;
}

export default {
  title: "Pages/WalletSettingsPage/WalletSettingsPage",
  component: WalletSettingsPage,
  decorators: [
    (Story, { args }) => {
      const mockDelegationContextState = {
        ...defaultDelegationContextState,
        getDelegationStatus: () => args.delegationStatus ?? "no-delegation",
        getPendingReceivedRequestsToBeDelegate: () =>
          args.pendingReceivedRequestsToBeDelegate ?? [],
        getHasPendingReceivedRequestsToBeDelegate: () =>
          args.hasPendingReceivedRequestsToBeDelegate ?? false,
        getPendingSentRequestsToBeDelegate: () =>
          args.pendingSentRequestsToBeDelegate ?? [],
        getHasPendingSentRequestsToBeDelegate: () =>
          args.hasPendingSentRequestsToBeDelegate ?? false,
        getDelegateAddress: () => args.delegateAddress,
        getDelegatorAddress: () => args.delegatorAddress,
        sendRequestToBeDelegate: (delegateAddress: string) =>
          alert(`sent request to be delegate to ${delegateAddress}`),
        cancelSentRequestToBeDelegate: () =>
          alert("cancelled sent request to be delegate"),
        acceptReceivedRequestToBeDelegate: (delegatorAddress: string) =>
          alert(
            `accepted received request to be delegate from ${delegatorAddress}`
          ),
        ignoreReceivedRequestToBeDelegate: (delegatorAddress: string) =>
          alert(
            `ignored received request to be delegate from ${delegatorAddress}`
          ),
        terminateRelationshipWithDelegate: () =>
          alert("terminated relationship with delegate"),
        terminateRelationshipWithDelegator: () =>
          alert("terminated relationship with delegator"),
      };
      return (
        <DelegationContext.Provider value={mockDelegationContextState}>
          <Story />
        </DelegationContext.Provider>
      );
    },
  ],
} as Meta<StoryProps>;

const commonArgs = {
  walletIcon: mockWalletIcon,
};

const Template: Story<StoryProps> = () => <WalletSettingsPage />;

export const NoWalletConnected = Template.bind({});
NoWalletConnected.args = {
  ...commonArgs,
  delegationStatus: "no-wallet-connected",
  address: undefined,
};

export const NoDelegation = Template.bind({});
NoDelegation.args = {
  ...commonArgs,
  delegationStatus: "no-delegation",
  address: mockAddress1,
};

export const IsDelegator = Template.bind({});
IsDelegator.args = {
  ...commonArgs,
  delegationStatus: "delegator",
  address: mockAddress1,
  delegateAddress: mockAddress2,
  delegatorAddress: mockAddress1,
};

export const IsDelegate = Template.bind({});
IsDelegate.args = {
  ...commonArgs,
  delegationStatus: "delegate",
  address: mockAddress2,
  delegateAddress: mockAddress2,
  delegatorAddress: mockAddress1,
};

export const PendingIsDelegator = Template.bind({});
PendingIsDelegator.args = {
  ...commonArgs,
  delegationStatus: "delegator-pending",
  address: mockAddress1,
  delegateAddress: undefined,
  delegatorAddress: undefined,
  pendingSentRequestsToBeDelegate: [
    {
      transactionHash: mockDelegateRequestTransaction,
      delegator: mockAddress1,
      delegate: mockAddress2,
    },
  ],
  hasPendingSentRequestsToBeDelegate: true,
};

export const PendingIsDelegate = Template.bind({});
PendingIsDelegate.args = {
  ...commonArgs,
  delegationStatus: "delegate-pending",
  address: mockAddress2,
  delegateAddress: undefined,
  delegatorAddress: undefined,
  pendingReceivedRequestsToBeDelegate: [
    {
      transactionHash: mockDelegateRequestTransaction,
      delegator: mockAddress1,
      delegate: mockAddress2,
    },
    {
      transactionHash: mockDelegateRequestTransaction,
      delegator: mockAddress3,
      delegate: mockAddress2,
    },
  ],
  hasPendingReceivedRequestsToBeDelegate: true,
};
