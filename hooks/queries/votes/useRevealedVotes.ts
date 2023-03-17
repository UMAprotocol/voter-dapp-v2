import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VoteExistsByKeyT } from "types";
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

  const queryResult = useQuery(
    [revealedVotesKey, address, roundId],
    // we update cache client side when we know we successfully revealed, so we want to merge data in the cache,
    // and not override, in case the web3 call returns empty as we use a different provider to query vs write.
    async () => {
      const result = await getRevealedVotes(voting, address, roundId);
      // this is really ugly, but I cant figure out a better way to merge cache and stil return the data
      return new Promise<VoteExistsByKeyT>((res) =>
        queryClient.setQueryData<VoteExistsByKeyT>(
          [revealedVotesKey, address, roundId],
          (oldRevealedVotes) => {
            const merged = {
              ...oldRevealedVotes,
              ...result,
            };
            res(merged);
            return merged;
          }
        )
      );
    },
    {
      enabled: !!address && !isWrongChain,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
