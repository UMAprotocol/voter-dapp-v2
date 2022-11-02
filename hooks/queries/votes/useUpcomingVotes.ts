import { useQuery } from "@tanstack/react-query";
import { upcomingVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
} from "hooks";
import { getUpcomingVotes } from "web3";

export function useUpcomingVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [upcomingVotesKey, roundId],
    () => getUpcomingVotes(voting, roundId),
    {
      refetchInterval(data) {
        return data ? false : 100;
      },
      initialData: {
        upcomingVotes: {},
        hasUpcomingVotes: false,
      },
      onError,
    }
  );

  return queryResult;
}
