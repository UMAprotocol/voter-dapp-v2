import { useQuery } from "@tanstack/react-query";
import { oneMinute, pastVotesKey, phaseLengthMilliseconds } from "constant";
import { getPastVotesAllVersions } from "graph";
import { config } from "helpers/config";
import { useHandleError, useVoteTimingContext } from "hooks";

export function usePastVotes() {
  const { roundId, phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  // the list only gains entries when a round resolves, and roundId in the
  // query key forces a fresh fetch each round — but the subgraph can lag the
  // chain, so that first fetch may not include the just-resolved requests
  // yet. Poll for the first minutes of the new round until indexing catches
  // up, then rest instead of polling the full history forever.
  const roundJustRolled =
    phase === "commit" &&
    phaseLengthMilliseconds - millisecondsUntilPhaseEnds < 15 * oneMinute;

  const queryResult = useQuery({
    queryKey: [pastVotesKey, roundId],
    queryFn: () => getPastVotesAllVersions(),
    enabled: config.graphV2Enabled,
    refetchInterval: roundJustRolled ? oneMinute : false,
    staleTime: 10 * oneMinute,
    onError,
  });

  return queryResult;
}
