import { useDelegationContext } from "hooks";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegate({ hasPending }: { hasPending?: boolean }) {
  const {
    getDelegatorAddress,
    acceptReceivedRequestToBeDelegate,
    ignoreReceivedRequestToBeDelegate,
    terminateRelationshipWithDelegator,
    getPendingReceivedRequestsToBeDelegate,
  } = useDelegationContext();

  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegate"} />
      {hasPending ? (
        <PendingRequests
          requestType="delegator"
          pendingRequests={getPendingReceivedRequestsToBeDelegate()}
          acceptReceivedRequestToBeDelegate={acceptReceivedRequestToBeDelegate}
          ignoreReceivedRequestToBeDelegate={ignoreReceivedRequestToBeDelegate}
        />
      ) : (
        <OtherWallet status="delegator" address={getDelegatorAddress()} remove={terminateRelationshipWithDelegator} />
      )}
    </>
  );
}
