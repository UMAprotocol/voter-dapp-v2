import { useDelegationContext } from "hooks/contexts/useDelegationContext";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegate() {
  const {
    getDelegatorAddress,
    acceptDelegatorRequest,
    ignoreDelegatorRequest,
    removeDelegator,
    getPendingSetDelegateRequestsForDelegate,
    getHasPendingSetDelegateRequestsForDelegate,
  } = useDelegationContext();
  const hasPending = getHasPendingSetDelegateRequestsForDelegate();

  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegate"} />
      {hasPending ? (
        <PendingRequests
          requestType="delegator"
          pendingRequests={getPendingSetDelegateRequestsForDelegate()}
          acceptDelegatorRequest={acceptDelegatorRequest}
          ignoreDelegatorRequest={ignoreDelegatorRequest}
        />
      ) : (
        <OtherWallet status="delegator" address={getDelegatorAddress()} remove={removeDelegator} />
      )}
    </>
  );
}
