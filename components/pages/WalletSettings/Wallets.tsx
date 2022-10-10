import styled from "styled-components";
import { DelegateWhenDelegateIsConnected } from "./DelegatedWalletConnected";
import { DelegateWhenDelegatorIsConnected } from "./DelegateWhenDelegatorIsConnected";
import { Delegator } from "./Delegator";

interface Props {
  address: string | undefined;
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
    if (connectedAddressIsDelegate) return "is-delegate";
    return "is-primary";
  }
  const component = determineComponent();

  return (
    <Wrapper>
      {component === "no-wallet-connected" && <NoWalletConnected />}
      {component === "is-primary" && (
        <PrimaryWallet
          address={connectedAddress}
          delegateAddress={delegateAddress}
          delegateRequestAccepted={delegateRequestAccepted}
          delegateRequestTransaction={delegateRequestTransaction}
          walletIcon={walletIcon}
          addDelegate={addDelegate}
          cancelDelegateRequest={cancelDelegateRequest}
          removeDelegate={removeDelegate}
        />
      )}
      {component === "is-delegate" && (
        <DelegateWallet
          delegateAddress={delegateAddress}
          delegatorAddress={delegatorAddress}
          delegateRequestAccepted={delegateRequestAccepted}
          delegateRequestTransaction={delegateRequestTransaction}
          walletIcon={walletIcon}
          approveDelegateRequest={approveDelegateRequest}
          ignoreDelegateRequest={ignoreDelegateRequest}
          removeDelegate={removeDelegate}
        />
      )}
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
  address,
  delegateAddress,
  delegateRequestAccepted,
  delegateRequestTransaction,
  walletIcon,
  addDelegate,
  cancelDelegateRequest,
  removeDelegate,
}: {
  address: string | undefined;
  delegateAddress: string | undefined;
  delegateRequestAccepted: boolean;
  delegateRequestTransaction: string | undefined;
  walletIcon: string | undefined;
  addDelegate: () => void;
  cancelDelegateRequest: () => void;
  removeDelegate: () => void;
}) {
  function getStatus() {
    if (!delegateAddress) return "not-requested";
    if (delegateAddress && !delegateRequestAccepted) return "awaiting-approval";
    return "accepted";
  }

  const status = getStatus();

  return (
    <>
      <Header>Primary Wallet</Header>
      <Text>
        Short introduction to why this is here and how it works and more info text info text info text info text info
        text info text info text info text{" "}
      </Text>
      <Delegator address={address} isConnected={true} walletIcon={walletIcon} />
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
