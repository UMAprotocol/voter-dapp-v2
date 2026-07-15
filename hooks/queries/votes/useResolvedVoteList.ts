import { useQueries } from "@tanstack/react-query";
import { resolvedAncillaryDataKey } from "constant";
import { BigNumber } from "ethers";
import { decodeHexString, getVoteMetaData } from "helpers";
import { resolveAncillaryData } from "helpers/voting/resolveAncillaryData";
import { getBridgedFields } from "lib/deeplink-matching";
import { VoteT } from "types";

// Bridged (L2) votes carry a reference to their real ancillary data instead
// of the data itself. Lists ship them unresolved — resolving the full vote
// history costs one API call per vote. This hook resolves only the votes
// passed in (i.e. the ones on screen) and re-derives the metadata that
// depends on the resolved data. Resolution is immutable, so each vote is
// fetched at most once.
export function useResolvedVoteList(votes: VoteT[]) {
  const results = useQueries({
    queries: votes.map((vote) => ({
      queryKey: [resolvedAncillaryDataKey, vote.uniqueKey],
      queryFn: () =>
        resolveAncillaryData({
          identifier: vote.identifier,
          time: BigNumber.from(vote.time),
          ancillaryData: vote.ancillaryData,
        }),
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: needsResolution(vote),
    })),
  });

  const resolvedVotes = votes.map((vote, i) => {
    const resolved = results[i]?.data;
    if (!resolved || resolved === vote.ancillaryDataL2) return vote;
    try {
      const decodedAncillaryData = decodeHexString(resolved);
      return {
        ...vote,
        ancillaryDataL2: resolved,
        decodedAncillaryData,
        ...getVoteMetaData(
          vote.decodedIdentifier,
          decodedAncillaryData,
          vote.contentfulData
        ),
      };
    } catch {
      return vote;
    }
  });

  const isResolving = results.some(
    (result, i) => needsResolution(votes[i]) && result.isLoading
  );

  return { resolvedVotes, isResolving };
}

function needsResolution(vote: VoteT) {
  return (
    vote.ancillaryDataL2 === vote.ancillaryData &&
    !!getBridgedFields(vote.ancillaryData)
  );
}
