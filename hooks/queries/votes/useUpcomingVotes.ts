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

  const queryResult = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [upcomingVotesKey, roundId, newVotesAdded],
    queryFn: () => getUpcomingVotes(voting, roundId),
    onError,
  });

  return queryResult;
}
