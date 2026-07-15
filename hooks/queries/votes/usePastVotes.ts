import { useQuery } from "@tanstack/react-query";
import { oneMinute, pastVotesKey } from "constant";
import { getPastVotesAllVersions } from "graph";
import { config } from "helpers/config";
import {
  useHandleError,
  useRoundJustRolled,
  useVoteTimingContext,
} from "hooks";

export function usePastVotes() {
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  // the list only gains entries when a round resolves, and roundId in the
  // query key forces a fresh fetch each round — poll while the subgraph
  // catches up, then rest instead of polling the full history forever
  const roundJustRolled = useRoundJustRolled();

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
