import { useQuery } from "@tanstack/react-query";
import { receivedRequestsToBeDelegateKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useNewReceivedRequestsToBeDelegate,
  useUserContext,
  useWalletContext,
} from "hooks";
import { getDelegateSetEvents } from "web3";

export function useReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const newRequests = useNewReceivedRequestsToBeDelegate();

  const queryResult = useQuery({
    queryKey: [receivedRequestsToBeDelegateKey, address, newRequests],
    queryFn: () => getDelegateSetEvents(voting, address, "delegate"),
    enabled: !!address && !isWrongChain,
    onError,
  });

  return queryResult;
}
