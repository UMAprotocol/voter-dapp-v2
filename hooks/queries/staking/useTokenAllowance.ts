import { useQuery } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getTokenAllowance } from "web3";

export function useTokenAllowance(address: string | undefined) {
  const { votingTokenWriter } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [tokenAllowanceKey, address],
    queryFn: () => getTokenAllowance(votingTokenWriter, address),
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
