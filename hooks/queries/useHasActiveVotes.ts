import { useQuery } from "@tanstack/react-query";
import { hasActiveVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import getHasActiveVotes from "web3/queries/getHasActiveVotes";

export default function useHasActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();

  const { isLoading, isError, data, error } = useQuery([hasActiveVotesKey, roundId], () => getHasActiveVotes(voting), {
    refetchInterval: (data) => (data ? false : 100),
  });

  const hasActiveVotes = data?.[0];

  return {
    hasActiveVotes,
    hasActiveVotesIsLoading: isLoading,
    hasActiveVotesIsError: isError,
    hasActiveVotesError: error,
  };
}
