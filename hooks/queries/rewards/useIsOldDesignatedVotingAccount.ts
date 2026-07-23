import { useQuery } from "@tanstack/react-query";
import { isOldDesignatedVotingAccountKey } from "constant";
import { useHandleError, useWalletContext } from "hooks";
import { getIsOldDesignatedVotingAccount } from "web3";

export function useIsOldDesignatedVotingAccount(address: string | undefined) {
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [isOldDesignatedVotingAccountKey, address],
    queryFn: () => getIsOldDesignatedVotingAccount(address),
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
