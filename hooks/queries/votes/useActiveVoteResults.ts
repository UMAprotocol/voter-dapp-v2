import { useQuery } from "@tanstack/react-query";
import { activeVoteResultsKey, oneMinute } from "constant";
import { getActiveVoteResults } from "graph";
import { config } from "helpers/config";
import { useHandleError, useVoteTimingContext } from "hooks";

export function useActiveVoteResults() {
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [activeVoteResultsKey, roundId],
    queryFn: () => getActiveVoteResults(),
    enabled: config.graphV2Enabled,
    refetchInterval: oneMinute,
    onError,
  });

  return queryResult;
}
