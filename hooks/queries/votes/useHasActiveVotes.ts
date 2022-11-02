import { useQuery } from "@tanstack/react-query";
import { hasActiveVotesKey } from "constant";
import { useContractsContext, useHandleError, useVoteTimingContext } from "hooks";
import { getHasActiveVotes } from "web3";

export function useHasActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([hasActiveVotesKey, roundId], () => getHasActiveVotes(voting), {
    refetchInterval: (data) => (data ? false : 100),
    onError,
  });

  return queryResult;
}
