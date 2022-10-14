import { useDelegationContext } from "hooks/contexts/useDelegationContext";
import { ConnectedWallet } from "./ConnectedWallet";
import { OtherWallet } from "./OtherWallet";
import { PendingRequests } from "./PendingRequests";

export function IsDelegate({ hasPending }: { hasPending?: boolean }) {
  const {
    getDelegatorAddress,
    acceptDelegatorRequest,
    ignoreRequestToBeDelegate,
    removeDelegator,
    getPendingSetDelegateRequestsForDelegate,
  } = useDelegationContext();

  return (
    <>
      <ConnectedWallet status={hasPending ? "none" : "delegate"} />
      {hasPending ? (
        <PendingRequests
          requestType="delegator"
          pendingRequests={getPendingSetDelegateRequestsForDelegate()}
          acceptDelegatorRequest={acceptDelegatorRequest}
          ignoreRequestToBeDelegate={ignoreRequestToBeDelegate}
        />
      ) : (
        <OtherWallet status="delegator" address={getDelegatorAddress()} remove={removeDelegator} />
      )}
    </>
  );
}
