import { useQuery } from "@tanstack/react-query";
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
    onError,
    // resolved past votes are immutable — no need to poll or refetch
    staleTime: Infinity,
  });

  return queryResult;
}
