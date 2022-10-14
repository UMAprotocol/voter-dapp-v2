import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Wallets } from "components";
import { grey100 } from "constants/colors";
import { mockWalletIcon } from "stories/mocks/mockWalletIcon";

export default {
  title: "Pages/WalletSettingsPage/Wallets",
  component: Wallets,
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: "100%", padding: 50, backgroundColor: grey100 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof Wallets>;

const mockAddress1 = "0x12345678901234567890";
const mockAddress2 = "0x09876543211234567890";
const mockAddress3 = "0xfedcba98761234567890";
const mockDelegateRequestTransaction = "0xabcdef12345678901234567890";
const sendRequestToBeDelegate = () => alert("sendRequestToBeDelegate");
const terminateRelationshipWithDelegate = () => alert("terminateRelationshipWithDelegate");
const addDelegator = () => alert("addDelegator");
const terminateRelationshipWithDelegator = () => alert("terminateRelationshipWithDelegator");

const commonArgs = {
  walletIcon: mockWalletIcon,
  sendRequestToBeDelegate,
  terminateRelationshipWithDelegate,
  addDelegator,
  terminateRelationshipWithDelegator,
};

const Template: ComponentStory<typeof Wallets> = (args) => <Wallets {...commonArgs} {...args} />;

export const NoWalletConnected = Template.bind({});
NoWalletConnected.args = {
  ...commonArgs,
  delegationStatus: "no-wallet-connected",
  connectedAddress: undefined,
};

export const NoDelegation = Template.bind({});
NoDelegation.args = {
  ...commonArgs,
  delegationStatus: "no-delegation",
  connectedAddress: mockAddress1,
  delegateAddress: undefined,
  delegatorAddress: undefined,
  pendingSetDelegateRequestsForDelegate: [],
  pendingSetDelegateRequestsForDelegator: [],
};

export const IsDelegator = Template.bind({});
IsDelegator.args = {
  ...commonArgs,
  delegationStatus: "delegator",
  connectedAddress: mockAddress1,
  delegateAddress: mockAddress2,
  delegatorAddress: mockAddress1,
};

export const IsDelegate = Template.bind({});
IsDelegate.args = {
  ...commonArgs,
  delegationStatus: "delegate",
  connectedAddress: mockAddress2,
  delegateAddress: mockAddress2,
  delegatorAddress: mockAddress1,
};

export const PendingIsDelegator = Template.bind({});
PendingIsDelegator.args = {
  ...commonArgs,
  delegationStatus: "delegator-pending",
  connectedAddress: mockAddress1,
  delegateAddress: undefined,
  delegatorAddress: undefined,
  pendingSetDelegateRequestsForDelegate: [],
  pendingSetDelegateRequestsForDelegator: [
    {
      transactionHash: mockDelegateRequestTransaction,
      delegator: mockAddress1,
      delegate: mockAddress2,
    },
  ],
};

export const PendingIsDelegate = Template.bind({});
PendingIsDelegate.args = {
  ...commonArgs,
  delegationStatus: "delegate-pending",
  connectedAddress: mockAddress2,
  delegateAddress: undefined,
  delegatorAddress: undefined,
  pendingSetDelegateRequestsForDelegate: [
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
  pendingSetDelegateRequestsForDelegator: [],
};
