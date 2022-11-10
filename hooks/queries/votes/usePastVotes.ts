import { useQuery } from "@tanstack/react-query";
import { oneMinute, pastVotesKey } from "constant";
import { getPastVotesAllVersions } from "graph";
import { useHandleError, useVoteTimingContext } from "hooks";

export function usePastVotes() {
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [pastVotesKey, roundId],
    () => getPastVotesAllVersions(),
    {
      refetchInterval: (data) => (data ? oneMinute : 100),
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
