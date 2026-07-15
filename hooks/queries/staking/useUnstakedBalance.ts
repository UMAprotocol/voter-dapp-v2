import { useQuery } from "@tanstack/react-query";
import { unstakedBalanceKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getUnstakedBalance } from "web3";

export function useUnstakedBalance(address: string | undefined) {
  const { votingToken } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [unstakedBalanceKey, address],
    queryFn: () => getUnstakedBalance(votingToken, address),
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
