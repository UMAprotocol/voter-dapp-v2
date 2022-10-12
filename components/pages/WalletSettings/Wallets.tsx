import styled from "styled-components";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";
import { AddDelegate } from "./AddDelegate";
import { ConnectedWallet } from "./ConnectedWallet";

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
  return (
    <Wrapper>
      {delegationStatus === "no-wallet-connected" && <NoWalletConnected />}
      {delegationStatus === "no-delegation" && (
        <NoDelegation connectedAddress={connectedAddress} walletIcon={walletIcon} addDelegate={addDelegate} />
      )}
      {delegationStatus === "delegator" && <IsDelegator />}
      {delegationStatus === "delegate" && <IsDelegate />}
      {delegationStatus === "delegator-pending" && (
        <IsDelegator
          hasPending={true}
          pendingSetDelegateRequestsForDelegator={pendingSetDelegateRequestsForDelegator}
        />
      )}
      {delegationStatus === "delegate-pending" && (
        <IsDelegate hasPending={true} pendingSetDelegateRequestsForDelegate={pendingSetDelegateRequestsForDelegate} />
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
  hasPending,
  pendingSetDelegateRequestsForDelegator,
}: {
  hasPending?: boolean;
  pendingSetDelegateRequestsForDelegator?: DelegationEventT[];
}) {
  return <div>is delegator {JSON.stringify(pendingSetDelegateRequestsForDelegator)}</div>;
}

function IsDelegate({
  hasPending,
  pendingSetDelegateRequestsForDelegate,
}: {
  hasPending?: boolean;
  pendingSetDelegateRequestsForDelegate?: DelegationEventT[];
}) {
  return <div>is delegate {JSON.stringify(pendingSetDelegateRequestsForDelegate)}</div>;
}
