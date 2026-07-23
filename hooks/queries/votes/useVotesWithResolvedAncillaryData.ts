import { useQueries, useQuery } from "@tanstack/react-query";
import { resolvedAncillaryDataKey } from "constant";
import { BigNumber } from "ethers";
import { decodeHexString, getVoteMetaData } from "helpers";
import { resolveAncillaryData } from "helpers/voting/resolveAncillaryData";
import { hasL2AncillaryDataStamp } from "lib/l2-ancillary-data";
import { useMemo } from "react";
import { VoteT } from "types";

/**
 * Past votes are fetched without resolving L2 ancillary data, because doing so
 * for the full history costs one request per vote. This hook resolves only the
 * votes passed in (i.e. the ones on screen). Votes that were never bridged
 * from an L2 spoke resolve to themselves and skip the network entirely.
 *
 * Resolution is immutable, so each vote is cached forever once resolved.
 */
/**
 * Whether the resolution query for this vote has failed outright (retries
 * exhausted). Observes the cache entry useVotesWithResolvedAncillaryData
 * populates; disabled so it never fetches on its own.
 */
export function useAncillaryDataResolutionErrored(
  uniqueKey: string | undefined
): boolean {
  const { isError } = useQuery({
    queryKey: [resolvedAncillaryDataKey, uniqueKey],
    queryFn: () => Promise.reject(new Error("observer only, never fetches")),
    enabled: false,
  });
  return isError;
}

export function useVotesWithResolvedAncillaryData(votes: VoteT[]): VoteT[] {
  const votesNeedingResolution = useMemo(
    () =>
      votes.filter((vote) =>
        hasL2AncillaryDataStamp(vote.decodedAncillaryData)
      ),
    [votes]
  );

  const queryResults = useQueries({
    queries: votesNeedingResolution.map((vote) => ({
      queryKey: [resolvedAncillaryDataKey, vote.uniqueKey],
      queryFn: async () => {
        const ancillaryDataL2 = await resolveAncillaryData({
          identifier: vote.identifier,
          time: BigNumber.from(vote.time),
          ancillaryData: vote.ancillaryData,
        });
        // the resolver falls back to the original (still-stamped) value when
        // it cannot reach the child chain — cache that as an error so the
        // query retries, not as a fresh-forever success
        if (hasL2AncillaryDataStamp(decodeHexString(ancillaryDataL2))) {
          throw new Error(
            `L2 ancillary data still unresolved for ${vote.uniqueKey}`
          );
        }
        return { uniqueKey: vote.uniqueKey, ancillaryDataL2 };
      },
      staleTime: Infinity,
    })),
  });

  return useMemo(() => {
    const resolvedByKey: Record<string, string> = {};
    for (const result of queryResults) {
      if (result.data) {
        resolvedByKey[result.data.uniqueKey] = result.data.ancillaryDataL2;
      }
    }

    if (Object.keys(resolvedByKey).length === 0) return votes;

    return votes.map((vote) => {
      const ancillaryDataL2 = resolvedByKey[vote.uniqueKey];
      if (!ancillaryDataL2 || ancillaryDataL2 === vote.ancillaryDataL2) {
        return vote;
      }
      let decodedAncillaryData: string;
      try {
        decodedAncillaryData = decodeHexString(ancillaryDataL2);
      } catch {
        return vote;
      }
      return {
        ...vote,
        ancillaryDataL2,
        decodedAncillaryData,
        // title and description are derived from ancillary data, so they must
        // be recomputed with the resolved value
        ...getVoteMetaData(
          vote.decodedIdentifier,
          decodedAncillaryData,
          vote.contentfulData
        ),
      };
    });
  }, [votes, queryResults]);
}
