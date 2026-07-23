import { useQuery } from "@tanstack/react-query";
import { oneMinute } from "constant";
import { getPastVoteDetails } from "graph";
import { config } from "helpers/config";
import { useHandleError, useRoundJustRolled } from "hooks";

export function usePastVoteDetails(resolvedPriceRequestIndex?: number) {
  const { onError } = useHandleError({ isDataFetching: true });
  const roundJustRolled = useRoundJustRolled();

  const queryResult = useQuery({
    queryKey: ["pastVoteDetails", resolvedPriceRequestIndex],
    queryFn: async () => {
      if (resolvedPriceRequestIndex === undefined) return null;
      return getPastVoteDetails(resolvedPriceRequestIndex);
    },
    enabled: config.graphV2Enabled && resolvedPriceRequestIndex !== undefined,
    onError,
    // resolved past votes are immutable — but a details fetch that races the
    // subgraph right after a round rolls can return incomplete data, so poll
    // through that window (refetchInterval fires regardless of staleTime)
    staleTime: Infinity,
    refetchInterval: roundJustRolled ? oneMinute : false,
  });

  return queryResult;
}
