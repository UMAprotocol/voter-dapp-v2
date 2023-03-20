import { useQuery, useQueryClient } from "@tanstack/react-query";
import { revealedVotesKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { getRevealedVotes } from "web3";

export function useRevealedVotes(addressOverride?: string) {
  const queryClient = useQueryClient();
  const { voting } = useContractsContext();
  const { address: myAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride ?? myAddress;

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
    initialData: {},
    onError,
  });

  return queryResult;
}
