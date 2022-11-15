import { useQuery } from "@tanstack/react-query";
import { receivedRequestsToBeDelegateKey } from "constant";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegateSetEvents } from "web3";

export function useReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [receivedRequestsToBeDelegateKey, address],
    () => getDelegateSetEvents(voting, address, "delegate"),
    {
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
