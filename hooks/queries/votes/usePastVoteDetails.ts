import { useQuery } from "@tanstack/react-query";
import { oneMinute } from "constant";
import { getPastVoteDetails } from "graph";
import { config } from "helpers/config";
import { useHandleError } from "hooks";

type VoteDetailsData = {
  participation?: any;
  results?: any;
  revealedVoteByAddress?: any;
} | null;

export function usePastVoteDetails(resolvedPriceRequestIndex?: number) {
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery<VoteDetailsData>({
    queryKey: ["pastVoteDetails", resolvedPriceRequestIndex],
    queryFn: async (): Promise<VoteDetailsData> => {
      if (resolvedPriceRequestIndex === undefined) return null;
      return getPastVoteDetails(
        resolvedPriceRequestIndex
      ) as Promise<VoteDetailsData>;
    },
    enabled: config.graphV2Enabled && resolvedPriceRequestIndex !== undefined,
    refetchInterval: oneMinute,
    onError,
    staleTime: 5 * oneMinute, // Cache for 5 minutes since past votes don't change
  });

  return queryResult;
}
