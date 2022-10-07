import styled from "styled-components";
import { DelegateWhenDelegateIsConnected } from "./DelegatedWalletConnected";
import { DelegateWhenDelegatorIsConnected } from "./DelegateWhenDelegatorIsConnected";
import { Delegator } from "./Delegator";

interface Props {
  connectedAddress: string | undefined;
  connectedAddressIsDelegator: boolean;
  delegatorAddress: string | undefined;
  connectedAddressIsDelegate: boolean;
  delegateAddress: string | undefined;
  awaitingApproval: boolean;
  delegateRequestAccepted: boolean;
  delegateRequestTransaction: string | undefined;
  walletIcon: string | undefined;
  addDelegate: () => void;
  cancelDelegateRequest: () => void;
  approveDelegateRequest: () => void;
  ignoreDelegateRequest: () => void;
  removeDelegate: () => void;
}
export function Wallets({
  connectedAddress,
  connectedAddressIsDelegator,
  delegatorAddress,
  connectedAddressIsDelegate,
  delegateAddress,
  awaitingApproval,
  delegateRequestAccepted,
  delegateRequestTransaction,
  walletIcon,
  addDelegate,
  cancelDelegateRequest,
  approveDelegateRequest,
  ignoreDelegateRequest,
  removeDelegate,
}: Props) {
  function determineComponent() {
    if (!connectedAddress) return "no-wallet-connected";
    if (connectedAddressIsDelegator) return "is-delegator";
    if (connectedAddressIsDelegate) return "is-delegate";
    return "no-delegate-requested";
  }
  const component = determineComponent();

  return (
    <>
      {component === "no-wallet-connected" && <NoWalletConnected />}
      {component === "no-delegate-requested" && <NoDelegateRequested addDelegate={addDelegate} />}
      {component === "is-delegator" && (
        <DelegatorIsConnected
          delegatorAddress={delegatorAddress}
          delegateAddress={delegateAddress}
          awaitingApproval={awaitingApproval}
          delegateRequestAccepted={delegateRequestAccepted}
          delegateRequestTransaction={delegateRequestTransaction}
          walletIcon={walletIcon}
          addDelegate={addDelegate}
          cancelDelegateRequest={cancelDelegateRequest}
          removeDelegate={removeDelegate}
        />
      )}
      {component === "is-delegate" && (
        <DelegateIsConnected
          delegateAddress={delegateAddress}
          delegatorAddress={delegatorAddress}
          awaitingApproval={awaitingApproval}
          delegateRequestAccepted={delegateRequestAccepted}
          delegateRequestTransaction={delegateRequestTransaction}
          walletIcon={walletIcon}
          approveDelegateRequest={approveDelegateRequest}
          ignoreDelegateRequest={ignoreDelegateRequest}
          removeDelegate={removeDelegate}
        />
      )}
    </>
  );
}

function NoWalletConnected() {
  return <div>No wallet connected</div>;
}

function NoDelegateRequested({ addDelegate }: { addDelegate: () => void }) {
  return <div>is neither</div>;
}

function DelegatorIsConnected({
  delegatorAddress,
  delegateAddress,
  awaitingApproval,
  delegateRequestAccepted,
  delegateRequestTransaction,
  walletIcon,
  addDelegate,
  cancelDelegateRequest,
  removeDelegate,
}: {
  delegatorAddress: string | undefined;
  delegateAddress: string | undefined;
  awaitingApproval: boolean;
  delegateRequestAccepted: boolean;
  delegateRequestTransaction: string | undefined;
  walletIcon: string | undefined;
  addDelegate: () => void;
  cancelDelegateRequest: () => void;
  removeDelegate: () => void;
}) {
  return (
    <>
      <Header>Primary Wallet</Header>
      <Text>
        Short introduction to why this is here and how it works and more info text info text info text info text info
        text info text info text info text{" "}
      </Text>
      <Delegator address={delegatorAddress} isConnected={true} walletIcon={walletIcon} />
      <Header>Delegated Wallet</Header>
      <Text>
        Short introduction to why this is here and how it works and more info text info text info text info text info
        text info text info text info text{" "}
      </Text>
      <DelegateWhenDelegatorIsConnected
        address={delegateAddress}
        awaitingApproval={awaitingApproval}
        delegateRequestAccepted={delegateRequestAccepted}
        delegateRequestTransaction={delegateRequestTransaction}
        addDelegate={addDelegate}
        cancelDelegateRequest={cancelDelegateRequest}
        removeDelegate={removeDelegate}
      />
    </>
  );
}

function DelegateIsConnected({
  delegateAddress,
  delegatorAddress,
  awaitingApproval,
  delegateRequestAccepted,
  delegateRequestTransaction,
  walletIcon,
  approveDelegateRequest,
  ignoreDelegateRequest,
  removeDelegate,
}: {
  delegateAddress: string | undefined;
  delegatorAddress: string | undefined;
  awaitingApproval: boolean;
  delegateRequestAccepted: boolean;
  delegateRequestTransaction: string | undefined;
  walletIcon: string | undefined;
  approveDelegateRequest: () => void;
  ignoreDelegateRequest: () => void;
  removeDelegate: () => void;
}) {
  return (
    <>
      <Header>Delegated Wallet</Header>
      <Text>
        Short introduction to why this is here and how it works and more info text info text info text info text info
        text info text info text info text{" "}
      </Text>
      <DelegateWhenDelegateIsConnected
        address={delegateAddress}
        awaitingApproval={awaitingApproval}
        delegateRequestAccepted={delegateRequestAccepted}
        delegateRequestTransaction={delegateRequestTransaction}
        walletIcon={walletIcon}
        approveDelegateRequest={approveDelegateRequest}
        ignoreDelegateRequest={ignoreDelegateRequest}
        removeDelegate={removeDelegate}
      />
      <Header>Primary Wallet</Header>
      <Text>
        Short introduction to why this is here and how it works and more info text info text info text info text info
        text info text info text info text{" "}
      </Text>
      <Delegator address={delegatorAddress} walletIcon={walletIcon} isConnected={false} />
    </>
  );
}

const Header = styled.h1`
  font: var(--header-md);
`;

const Text = styled.p`
  font: var(--text-sm);
  max-width: 737px;
`;
