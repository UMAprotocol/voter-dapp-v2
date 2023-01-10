import { useQuery } from "@tanstack/react-query";
import { committedVotesForDelegatorKey, oneMinute } from "constant";
import {
  useContractsContext,
  useDelegationContext,
  useHandleError,
  useUserContext,
  useVoteTimingContext,
} from "hooks";
import { getCommittedVotes } from "web3";
import { VoteExistsByKeyT } from "types";

export function useCommittedVotesForDelegator() {
  const { address } = useUserContext();
  const { voting } = useContractsContext();
  const { getDelegationStatus, getDelegatorAddress } = useDelegationContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const status = getDelegationStatus();
  const delegatorAddress = getDelegatorAddress();

  const queryResult = useQuery(
    [committedVotesForDelegatorKey, address, delegatorAddress, roundId],
    async (): Promise<VoteExistsByKeyT> =>
      delegatorAddress
        ? getCommittedVotes(voting, delegatorAddress, roundId)
        : {},
    {
      refetchInterval: status === "delegate" ? oneMinute : false,
      enabled: !!address && !!delegatorAddress && status === "delegate",
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
