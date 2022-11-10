import { useQuery } from "@tanstack/react-query";
import { oneMinute, upcomingVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
} from "hooks";
import { getUpcomingVotes } from "web3";

export function useUpcomingVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [upcomingVotesKey, roundId],
    () => getUpcomingVotes(voting, roundId),
    {
      refetchInterval: (data) => (data ? oneMinute : 100),
      initialData: {
        upcomingVotes: {},
        hasUpcomingVotes: false,
      },
      onError,
    }
  );

  return queryResult;
}
