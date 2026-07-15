import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventsForDelegatorKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegator(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [delegatorSetEventsForDelegatorKey, address],
    queryFn: () => getDelegatorSetEvents(voting, address, "delegator"),
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
