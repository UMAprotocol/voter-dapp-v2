import { useQuery } from "@tanstack/react-query";
import { oneMinute, activeVoteResultsKey } from "constant";
import { getActiveVoteResults } from "graph";
import { useHandleError, useVoteTimingContext } from "hooks";
import { config } from "helpers/config";

export function useActiveVoteResults() {
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [activeVoteResultsKey, roundId],
    queryFn: () => getActiveVoteResults(),
    enabled: config.graphV2Enabled,
    refetchInterval: oneMinute,
    initialData: {},
    onError,
  });

  return queryResult;
}
