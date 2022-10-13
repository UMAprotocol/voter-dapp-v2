import { useDelegationContext } from "hooks";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegator({ hasPending }: { hasPending?: boolean }) {
  const {
    getDelegateAddress,
    getPendingSetDelegateRequestsForDelegator,
    acceptDelegateRequest,
    cancelDelegateRequest,
    removeDelegate,
  } = useDelegationContext();

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
