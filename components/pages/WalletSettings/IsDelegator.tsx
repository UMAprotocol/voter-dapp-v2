import { useDelegationContext } from "hooks";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegator({ hasPending }: { hasPending?: boolean }) {
  const {
    getDelegateAddress,
    getPendingSentRequestsToBeDelegate,
    cancelSentRequestToBeDelegate,
    terminateRelationshipWithDelegate,
  } = useDelegationContext();

  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegator"} />
      {hasPending ? (
        <PendingRequests
          requestType="delegator"
          pendingRequests={getPendingSentRequestsToBeDelegate()}
          cancelSentRequestToBeDelegate={cancelSentRequestToBeDelegate}
        />
      ) : (
        <OtherWallet
          status="delegate"
          address={getDelegateAddress()}
          remove={terminateRelationshipWithDelegate}
        />
      )}
    </>
  );
}
