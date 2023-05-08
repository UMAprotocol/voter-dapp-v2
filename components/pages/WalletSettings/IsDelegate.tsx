import { useDelegationContext } from "hooks";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegate({ hasPending }: { hasPending?: boolean }) {
  const {
    delegatorAddress,
    acceptReceivedRequestToBeDelegate,
    ignoreReceivedRequestToBeDelegate,
    terminateRelationshipWithDelegator,
    pendingReceivedRequestsToBeDelegate,
  } = useDelegationContext();

  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegate"} />
      {hasPending ? (
        <PendingRequests
          requestType="delegate"
          pendingRequests={pendingReceivedRequestsToBeDelegate}
          acceptReceivedRequestToBeDelegate={acceptReceivedRequestToBeDelegate}
          ignoreReceivedRequestToBeDelegate={ignoreReceivedRequestToBeDelegate}
        />
      ) : (
        <OtherWallet
          status="delegator"
          address={delegatorAddress}
          remove={terminateRelationshipWithDelegator}
        />
      )}
    </>
  );
}
