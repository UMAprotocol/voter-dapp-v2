import styled from "styled-components";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";
import { AddDelegate } from "./AddDelegate";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";

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
          removeDelegator={removeDelegator}
          walletIcon={walletIcon}
        />
      )}
      {delegationStatus === "delegator-pending" && (
        <IsDelegator
          connectedAddress={connectedAddress}
          delegateAddress={delegateAddress}
          walletIcon={walletIcon}
          hasPending={true}
          pendingSetDelegateRequestsForDelegator={pendingSetDelegateRequestsForDelegator}
          removeDelegate={removeDelegate}
        />
      )}
      {delegationStatus === "delegate-pending" && (
        <IsDelegate
          connectedAddress={connectedAddress}
          delegatorAddress={delegatorAddress}
          walletIcon={walletIcon}
          hasPending={true}
          pendingSetDelegateRequestsForDelegate={pendingSetDelegateRequestsForDelegate}
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
  hasPending,
  pendingSetDelegateRequestsForDelegator,
  walletIcon,
  removeDelegate,
}: {
  connectedAddress: string;
  delegateAddress: string | undefined;
  hasPending?: boolean;
  pendingSetDelegateRequestsForDelegator?: DelegationEventT[];
  walletIcon: string | undefined;
  removeDelegate: () => void;
}) {
  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegator"} address={connectedAddress} walletIcon={walletIcon} />
      {hasPending ? (
        <div>pending requests</div>
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
  hasPending,
  pendingSetDelegateRequestsForDelegate,
  removeDelegator,
}: {
  connectedAddress: string;
  delegatorAddress: string | undefined;
  walletIcon: string | undefined;
  hasPending?: boolean;
  pendingSetDelegateRequestsForDelegate?: DelegationEventT[];
  removeDelegator: () => void;
}) {
  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegate"} address={connectedAddress} walletIcon={walletIcon} />
      {hasPending ? (
        <div>pending requests</div>
      ) : (
        <OtherWallet status="delegator" address={delegatorAddress} remove={removeDelegator} />
      )}
    </>
  );
}
