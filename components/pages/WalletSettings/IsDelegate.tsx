import { DelegationEventT } from "types/global";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegate({
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
