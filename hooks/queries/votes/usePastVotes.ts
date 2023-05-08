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
    enabled: config.graphV1Enabled && config.graphV2Enabled,
    refetchInterval: oneMinute,
    onError,
  });

  return queryResult;
}
