import { useQuery } from "@tanstack/react-query";
import { receivedRequestsToBeDelegateKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useNewReceivedRequestsToBeDelegate,
  useUserContext,
} from "hooks";
import { getDelegateSetEvents } from "web3";

export function useReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const newRequests = useNewReceivedRequestsToBeDelegate();

  const queryResult = useQuery(
    [receivedRequestsToBeDelegateKey, address, newRequests],
    () => getDelegateSetEvents(voting, address, "delegate"),
    {
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
