import styled from "styled-components";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";
import { AddDelegate } from "./AddDelegate";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

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
  addDelegator: () => void;
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
  addDelegator,
  removeDelegator,
}: Props) {
  return (
    <Wrapper>
      {delegationStatus === "no-wallet-connected" && <NoWalletConnected />}
      {delegationStatus === "no-delegation" && (
        <NoDelegation connectedAddress={connectedAddress} walletIcon={walletIcon} addDelegate={addDelegate} />
      )}
      {delegationStatus === "delegator" && (
        <IsDelegator
          connectedAddress={connectedAddress}
          delegateAddress={delegateAddress}
          walletIcon={walletIcon}
          removeDelegate={removeDelegate}
        />
      )}
      {delegationStatus === "delegate" && (
        <IsDelegate
          connectedAddress={connectedAddress}
          delegatorAddress={delegatorAddress}
          addDelegator={addDelegator}
          removeDelegator={removeDelegator}
          walletIcon={walletIcon}
        />
      )}
      {delegationStatus === "delegator-pending" && (
        <IsDelegator
          connectedAddress={connectedAddress}
          delegateAddress={delegateAddress}
          walletIcon={walletIcon}
          pendingSetDelegateRequestsForDelegator={pendingSetDelegateRequestsForDelegator}
          removeDelegate={removeDelegate}
        />
      )}
      {delegationStatus === "delegate-pending" && (
        <IsDelegate
          connectedAddress={connectedAddress}
          delegatorAddress={delegatorAddress}
          walletIcon={walletIcon}
          pendingSetDelegateRequestsForDelegate={pendingSetDelegateRequestsForDelegate}
          addDelegator={addDelegator}
          removeDelegator={removeDelegator}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: var(--grey-100);
`;

function NoWalletConnected() {
  return <div>no wallet connected</div>;
}

function NoDelegation({
  connectedAddress,
  walletIcon,
  addDelegate,
}: {
  connectedAddress: string;
  walletIcon: string | undefined;
  addDelegate: () => void;
}) {
  return (
    <>
      <ConnectedWallet status="none" address={connectedAddress} walletIcon={walletIcon} />
      <AddDelegate addDelegate={addDelegate} />
    </>
  );
}

function IsDelegator({
  connectedAddress,
  delegateAddress,
  pendingSetDelegateRequestsForDelegator,
  walletIcon,
  removeDelegate,
}: {
  connectedAddress: string;
  delegateAddress: string | undefined;
  pendingSetDelegateRequestsForDelegator?: DelegationEventT[];
  walletIcon: string | undefined;
  removeDelegate: () => void;
}) {
  const hasPending = pendingSetDelegateRequestsForDelegator && pendingSetDelegateRequestsForDelegator.length > 0;
  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegator"} address={connectedAddress} walletIcon={walletIcon} />
      {hasPending ? (
        <PendingRequests
          requestType="delegate"
          pendingRequests={pendingSetDelegateRequestsForDelegator}
          cancelRequest={removeDelegate}
        />
      ) : (
        <OtherWallet status="delegate" address={delegateAddress} remove={removeDelegate} />
      )}
    </>
  );
}

function IsDelegate({
  connectedAddress,
  delegatorAddress,
  walletIcon,
  pendingSetDelegateRequestsForDelegate,
  addDelegator,
  removeDelegator,
}: {
  connectedAddress: string;
  delegatorAddress: string | undefined;
  walletIcon: string | undefined;
  pendingSetDelegateRequestsForDelegate?: DelegationEventT[];
  addDelegator: () => void;
  removeDelegator: () => void;
}) {
  const hasPending = pendingSetDelegateRequestsForDelegate && pendingSetDelegateRequestsForDelegate.length > 0;
  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegate"} address={connectedAddress} walletIcon={walletIcon} />
      {hasPending ? (
        <PendingRequests
          requestType="delegator"
          pendingRequests={pendingSetDelegateRequestsForDelegate}
          acceptRequest={addDelegator}
          cancelRequest={removeDelegator}
        />
      ) : (
        <OtherWallet status="delegator" address={delegatorAddress} remove={removeDelegator} />
      )}
    </>
  );
}
