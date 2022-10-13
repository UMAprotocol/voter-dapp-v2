import { useDelegationContext } from "hooks";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegator() {
  const {
    getDelegateAddress,
    getPendingSetDelegateRequestsForDelegator,
    getHasPendingSetDelegateRequestsForDelegator,
    acceptDelegateRequest,
    cancelDelegateRequest,
    removeDelegate,
  } = useDelegationContext();
  const hasPending = getHasPendingSetDelegateRequestsForDelegator();

  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegator"} />
      {hasPending ? (
        <PendingRequests
          requestType="delegate"
          pendingRequests={getPendingSetDelegateRequestsForDelegator()}
          acceptDelegateRequest={acceptDelegateRequest}
          cancelDelegateRequest={cancelDelegateRequest}
        />
      ) : (
        <OtherWallet status="delegate" address={getDelegateAddress()} remove={removeDelegate} />
      )}
    </>
  );
}
