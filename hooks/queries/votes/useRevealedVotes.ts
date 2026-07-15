import { useQuery, useQueryClient } from "@tanstack/react-query";
import { revealedVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { getRevealedVotes } from "web3";

export function useRevealedVotes(address: string | undefined) {
  const queryClient = useQueryClient();
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryKey = [revealedVotesKey, address, roundId];
  const queryResult = useQuery({
    queryKey,
    // we update cache client side when we know we successfully revealed, so we want to merge data in the cache,
    // and not override, in case the web3 call returns empty as we use a different provider to query vs write.
    queryFn: () => getRevealedVotes(voting, address, roundId),
    onSuccess(data) {
      queryClient.setQueryData<typeof data>(queryKey, (oldRevealedVotes) =>
        oldRevealedVotes ? { ...oldRevealedVotes, ...data } : data
      );
    },
    enabled: !!address && !isWrongChain,
    // reveals can happen in another tab or device mid-round; refetching on
    // focus is the only path that picks them up (the app default is false)
    refetchOnWindowFocus: true,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
