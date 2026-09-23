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
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
