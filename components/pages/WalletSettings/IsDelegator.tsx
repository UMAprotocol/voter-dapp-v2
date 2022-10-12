import { DelegationEventT } from "types/global";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegator({
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
