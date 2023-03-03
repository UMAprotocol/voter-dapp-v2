import { useQuery } from "@tanstack/react-query";
import { getDelegateSetEvents } from "chain";
import { receivedRequestsToBeDelegateKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useNewReceivedRequestsToBeDelegate,
  useUserContext,
  useWalletContext,
} from "hooks";

export function useReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const newRequests = useNewReceivedRequestsToBeDelegate();

  const queryResult = useQuery(
    [receivedRequestsToBeDelegateKey, address, newRequests],
    () => getDelegateSetEvents(voting, address, "delegate"),
    {
      enabled: !!address && !isWrongChain,
      onError,
    }
  );

  return queryResult;
}
