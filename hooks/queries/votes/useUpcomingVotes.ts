import { useQuery } from "@tanstack/react-query";
import { getUpcomingVotes } from "chain";
import { upcomingVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useNewVotesAdded,
  useVoteTimingContext,
} from "hooks";

export function useUpcomingVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const newVotesAdded = useNewVotesAdded();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [upcomingVotesKey, roundId, newVotesAdded],
    () => getUpcomingVotes(voting, roundId),
    {
      initialData: {
        upcomingVotes: {},
        hasUpcomingVotes: false,
      },
      onError,
    }
  );

  return queryResult;
}
