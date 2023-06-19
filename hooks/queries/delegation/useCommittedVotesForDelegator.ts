import { useQuery } from "@tanstack/react-query";
import { committedVotesForDelegatorKey, oneMinute } from "constant";
import {
  useContractsContext,
  useDelegationContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { VoteExistsByKeyT } from "types";
import { getCommittedVotes } from "web3";

export function useCommittedVotesForDelegator() {
  const { isWrongChain } = useWalletContext();
  const { voting } = useContractsContext();
  const { delegatorAddress, isDelegate } = useDelegationContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [committedVotesForDelegatorKey, delegatorAddress, roundId],
    queryFn: async (): Promise<VoteExistsByKeyT> =>
      getCommittedVotes(voting, delegatorAddress, roundId),
    refetchInterval: isDelegate ? oneMinute : false,
    enabled: !isWrongChain && isDelegate,
    onError,
  });

  return queryResult;
}
