import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getEncryptedVotes } from "web3";

export function useEncryptedVotes(
  address: string | undefined,
  roundId?: number
) {
  const { voting, votingV1 } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [encryptedVotesKey, address, roundId],
    queryFn: () => getEncryptedVotes(voting, votingV1, address, roundId),
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
