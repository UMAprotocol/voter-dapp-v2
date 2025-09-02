import { useQuery } from "@tanstack/react-query";
import { oneMinute } from "constant";
import { getPastVoteDetails } from "graph";
import { config } from "helpers/config";
import { useHandleError } from "hooks";

export function usePastVoteDetails(resolvedPriceRequestIndex?: number) {
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: ["pastVoteDetails", resolvedPriceRequestIndex],
    queryFn: async () => {
      if (resolvedPriceRequestIndex === undefined) return null;
      return getPastVoteDetails(resolvedPriceRequestIndex);
    },
    enabled: config.graphV2Enabled && resolvedPriceRequestIndex !== undefined,
    refetchInterval: oneMinute,
    onError,
    staleTime: 5 * oneMinute, // Cache for 5 minutes since past votes don't change
  });

  return queryResult;
}
