import { useQuery } from "@tanstack/react-query";
import { committedVotesForDelegatorKey } from "constant/queryKeys";
import { useContractsContext, useDelegationContext, useHandleError, useUserContext, useVoteTimingContext } from "hooks";
import { getCommittedVotes } from "web3";

export function useCommittedVotesForDelegator() {
  const { address } = useUserContext();
  const { voting } = useContractsContext();
  const { getDelegationStatus, getDelegatorAddress } = useDelegationContext();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const status = getDelegationStatus();
  const delegatorAddress = getDelegatorAddress();

  const queryResult = useQuery(
    [committedVotesForDelegatorKey, address, delegatorAddress, roundId],
    () => getCommittedVotes(voting, delegatorAddress ?? address, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address && !!delegatorAddress && status === "delegate",
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
