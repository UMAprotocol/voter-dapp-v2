import styled from "styled-components";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";
import { IsDelegate } from "./IsDelegate";
import { IsDelegator } from "./IsDelegator";
import { NoDelegation } from "./NoDelegation";
import { NoWalletConnected } from "./NoWalletConnected";

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
