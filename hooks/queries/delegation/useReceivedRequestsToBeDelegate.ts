import { useQuery } from "@tanstack/react-query";
import { receivedRequestsToBeDelegateKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useNewReceivedRequestsToBeDelegate,
  useWalletContext,
} from "hooks";
import { getDelegateSetEvents } from "web3";

export function useReceivedRequestsToBeDelegate(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const newRequests = useNewReceivedRequestsToBeDelegate(address);

  const queryResult = useQuery({
    queryKey: [receivedRequestsToBeDelegateKey, address, newRequests],
    queryFn: () => getDelegateSetEvents(voting, address, "delegate"),
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
