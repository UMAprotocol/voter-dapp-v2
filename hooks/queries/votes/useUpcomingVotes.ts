import { useQuery } from "@tanstack/react-query";
import { upcomingVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useNewVotesAdded,
  useVoteTimingContext,
} from "hooks";
import { getUpcomingVotes } from "web3";

export function useUpcomingVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const newVotesAdded = useNewVotesAdded();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [upcomingVotesKey, roundId, newVotesAdded],
    () => getUpcomingVotes(voting, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: {
        upcomingVotes: {},
        hasUpcomingVotes: false,
      },
      onError,
    }
  );

  return queryResult;
}
