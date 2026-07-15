import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getStakerDetails } from "web3";

export function useStakerDetails(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const queryResult = useQuery({
    queryKey: [stakerDetailsKey, address],
    queryFn: () => getStakerDetails(voting, address),
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
