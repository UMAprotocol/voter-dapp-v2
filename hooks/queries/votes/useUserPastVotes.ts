import { useQuery } from "@tanstack/react-query";
import { oneMinute } from "constant";
import { getUserVotesForRequests } from "graph";
import { config } from "helpers/config";
import { useAccountDetails, useDelegationContext } from "hooks";
import { useMemo } from "react";
import { VoteT } from "types";

// This hook fetches user's vote data for the current page of past votes
export function useUserPastVotes(currentPageVotes: VoteT[] | undefined) {
  const { address: userAddress } = useAccountDetails();
  const { delegatorAddress } = useDelegationContext();

  // Use delegator address if delegating, otherwise user address
  const voterAddress = delegatorAddress || userAddress;

  // Get V2 vote indices for the current page
  const v2VoteIndices = useMemo(() => {
    return (
      currentPageVotes
        ?.filter((v) => !v.isV1 && v.resolvedPriceRequestIndex)
        ?.map((v) => parseInt(v.resolvedPriceRequestIndex!))
        ?.filter((index) => !isNaN(index)) || []
    );
  }, [currentPageVotes]);

  // Create a stable key from vote indices to prevent repeated calls
  const voteIndicesKey = useMemo(
    () => v2VoteIndices.join(","),
    [v2VoteIndices]
  );

  const queryResult = useQuery({
    queryKey: ["userPastVotesPage", voteIndicesKey, voterAddress],
    queryFn: async () => {
      if (!currentPageVotes || currentPageVotes.length === 0 || !voterAddress) {
        return {};
      }

      // Fetch user's votes for V2 price requests
      if (v2VoteIndices.length > 0) {
        const userVotes = await getUserVotesForRequests(
          v2VoteIndices,
          voterAddress
        );

        // Map the results back to vote unique keys
        const result: Record<string, Record<string, string>> = {};

        currentPageVotes.forEach((vote) => {
          if (
            !vote.isV1 &&
            vote.resolvedPriceRequestIndex &&
            userVotes[vote.resolvedPriceRequestIndex]
          ) {
            // User voted on this request - store with the ORIGINAL case address
            result[vote.uniqueKey] = {
              [voterAddress]: userVotes[vote.resolvedPriceRequestIndex],
            };
          }
        });

        return result;
      }

      return {};
    },
    enabled:
      config.graphV2Enabled &&
      !!currentPageVotes &&
      currentPageVotes.length > 0 &&
      !!voterAddress &&
      v2VoteIndices.length > 0,
    refetchInterval: oneMinute,
    staleTime: 5 * oneMinute,
  });

  return queryResult;
}
