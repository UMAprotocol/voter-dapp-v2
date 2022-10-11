import styled from "styled-components";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";
import { DelegateWhenDelegateIsConnected } from "./DelegatedWalletConnected";
import { DelegateWhenDelegatorIsConnected } from "./DelegateWhenDelegatorIsConnected";
import { Delegator as ConnectedWallet } from "./Delegator";

interface Props {
  delegationStatus: DelegationStatusT;
  pendingSetDelegateRequestsForDelegate: DelegationEventT[];
  pendingSetDelegateRequestsForDelegator: DelegationEventT[];
  connectedAddress: string;
  delegateAddress: string;
  delegatorAddress: string;
  walletIcon: string | undefined;
  addDelegate: () => void;
  removeDelegate: () => void;
  removeDelegator: () => void;
}
export function Wallets({
  delegationStatus,
  pendingSetDelegateRequestsForDelegate,
  pendingSetDelegateRequestsForDelegator,
  connectedAddress,
  delegateAddress,
  delegatorAddress,
  walletIcon,
  addDelegate,
  removeDelegate,
  removeDelegator,
}: Props) {
  function determineComponent() {
    if (!connectedAddress) return "no-wallet-connected";
    if (delegationStatus === "delegator") return "is-delegator";
    if (delegationStatus === "delegate") return "is-delegate";
    if (pendingSetDelegateRequestsForDelegate.length) return "pending-is-delegate";
    if (pendingSetDelegateRequestsForDelegator.length) return "pending-is-delegator";
    return "no-delegation";
  }
  const component = determineComponent();

  return (
    <Wrapper>
      {component === "no-wallet-connected" && <NoWalletConnected />}
      {component === "no-delegation" && <PrimaryWallet status="no-delegation" />}
      {component === "is-delegator" && <PrimaryWallet status="accepted" />}
      {component === "pending-is-delegator" && <PrimaryWallet status="pending" />}
      {component === "is-delegate" && <SecondaryWallet status="accepted" />}
      {component === "pending-is-delegate" && <SecondaryWallet status="pending" />}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: var(--grey-100);
`;

function NoWalletConnected() {
  return <div>No wallet connected</div>;
}

function PrimaryWallet({
  connectedAddress,
  delegateAddress,
  walletIcon,
  addDelegate,
  removeDelegate,
}: {
  status: "no-delegation" | "pending" | "accepted";
  connectedAddress: string | undefined;
  delegateAddress: string | undefined;
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
      <ConnectedWallet address={address} isConnected={true} walletIcon={walletIcon} />
      <Header>Delegated Wallet</Header>
      <Text>
        Short introduction to why this is here and how it works and more info text info text info text info text info
        text info text info text info text{" "}
      </Text>
      <DelegateWhenDelegatorIsConnected
        address={delegateAddress}
        status={status}
        delegateRequestTransaction={delegateRequestTransaction}
        addDelegate={addDelegate}
        cancelDelegateRequest={cancelDelegateRequest}
        removeDelegate={removeDelegate}
      />
    </>
  );
}

function DelegateWallet({
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
      <ConnectedWallet address={delegatorAddress} walletIcon={walletIcon} isConnected={false} />
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
