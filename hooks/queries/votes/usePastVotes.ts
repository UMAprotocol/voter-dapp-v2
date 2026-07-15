import { useQuery } from "@tanstack/react-query";
import { oneMinute, pastVotesKey } from "constant";
import { getPastVotesAllVersions } from "graph";
import { config } from "helpers/config";
import { useHandleError, useVoteTimingContext } from "hooks";

export function usePastVotes() {
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [pastVotesKey, roundId],
    queryFn: () => getPastVotesAllVersions(),
    enabled: config.graphV2Enabled,
    // the list only gains entries when a round resolves; roundId in the query
    // key already forces a fresh fetch each round, so don't poll the full
    // history in between
    staleTime: 10 * oneMinute,
    onError,
  });

  return queryResult;
}
