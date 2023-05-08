import { useQuery } from "@tanstack/react-query";
import { committedVotesForDelegatorKey, oneMinute } from "constant";
import {
  useContractsContext,
  useDelegationContext,
  useHandleError,
  useUserContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { VoteExistsByKeyT } from "types";
import { getCommittedVotes } from "web3";

export function useCommittedVotesForDelegator() {
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { voting } = useContractsContext();
  const { delegatorAddress, isDelegate } = useDelegationContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [
      committedVotesForDelegatorKey,
      address,
      delegatorAddress,
      roundId,
      voting,
    ],
    queryFn: async (): Promise<VoteExistsByKeyT> =>
      getCommittedVotes(voting, delegatorAddress, roundId),
    refetchInterval: isDelegate ? oneMinute : false,
    enabled: !!address && !isWrongChain && !!delegatorAddress && isDelegate,
    onError,
  });

  return queryResult;
}
