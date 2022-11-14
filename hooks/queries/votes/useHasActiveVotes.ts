import { useQuery } from "@tanstack/react-query";
import { hasActiveVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import { getHasActiveVotes } from "web3";

export function useHasActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const { hasUpcomingVotes } = useVotesContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [hasActiveVotesKey, roundId],
    () => getHasActiveVotes(voting),
    {
      refetchInterval: (data) => {
        if (data === undefined) return 100;
        if (hasUpcomingVotes && !data) return 100;
        return false;
      },
      onError,
    }
  );

  return queryResult;
}
