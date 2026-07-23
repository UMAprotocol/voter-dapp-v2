import { useQuery } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constant";
import { useContractsContext, useWalletContext } from "hooks";
import { getVoterFromDelegate } from "web3";

export function useVoterFromDelegate(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();

  const queryResult = useQuery({
    queryKey: [voterFromDelegateKey, address],
    queryFn: () => getVoterFromDelegate(voting, address),
    enabled: !!address && !isWrongChain,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
