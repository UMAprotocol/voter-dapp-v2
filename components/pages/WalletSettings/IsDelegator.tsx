import { useDelegationContext } from "hooks";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegator({ hasPending }: { hasPending?: boolean }) {
  const {
    getDelegateAddress,
    getPendingSentRequestsToBeDelegate,
    acceptDelegateRequest,
    cancelSentRequestToBeDelegate,
    terminateRelationshipWithDelegate,
  } = useDelegationContext();

  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegator"} />
      {hasPending ? (
        <PendingRequests
          requestType="delegate"
          pendingRequests={getPendingSentRequestsToBeDelegate()}
          acceptDelegateRequest={acceptDelegateRequest}
          cancelSentRequestToBeDelegate={cancelSentRequestToBeDelegate}
        />
      ) : (
        <OtherWallet status="delegate" address={getDelegateAddress()} remove={terminateRelationshipWithDelegate} />
      )}
    </>
  );
}
