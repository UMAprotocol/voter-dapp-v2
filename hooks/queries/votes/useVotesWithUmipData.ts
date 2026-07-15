import { useQuery } from "@tanstack/react-query";
import { contentfulDataKey, oneMinute } from "constant";
import { getVoteMetaData } from "helpers";
import { warnOnce } from "helpers/util/log";
import { ContentfulUmipsResponse } from "pages/api/contentful-umips";
import { useMemo } from "react";
import { ContentfulDataT, VoteT } from "types";

export function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}

/**
 * UMIP metadata from contentful only applies to governance ("Admin N") votes,
 * which are rare — fetch it for the votes passed in (i.e. the ones on screen)
 * instead of for every governance vote in history.
 */
export function useVotesWithUmipData(votes: VoteT[]): VoteT[] {
  const adminProposalNumbers = useMemo(
    () =>
      votes
        .map((vote) => getAdminProposalNumber(vote.decodedIdentifier))
        .filter((number): number is number => number !== null)
        .sort((a, b) => a - b),
    [votes]
  );

  const { data: umipsByNumber } = useQuery({
    queryKey: [contentfulDataKey, adminProposalNumbers.join(",")],
    queryFn: async () => {
      const response = await fetch(
        `/api/contentful-umips?numbers=${adminProposalNumbers.join(",")}`
      );
      if (!response.ok) {
        throw new Error(
          `Fetching UMIP data failed with status ${response.status}`
        );
      }
      const { entries } = (await response.json()) as ContentfulUmipsResponse;
      const byNumber: Record<number, ContentfulDataT> = {};
      entries.forEach((entry) => {
        byNumber[entry.number] = entry;
      });
      return byNumber;
    },
    enabled: adminProposalNumbers.length > 0,
    // published UMIP entries rarely change; the API route's CDN cache is
    // 10 minutes, so refetching more often would return the same response
    staleTime: 10 * oneMinute,
    onError: (error) =>
      warnOnce(
        "contentful",
        "Error fetching UMIP data from contentful:",
        error
      ),
  });

  return useMemo(() => {
    if (!umipsByNumber) return votes;
    return votes.map((vote) => {
      const adminProposalNumber = getAdminProposalNumber(
        vote.decodedIdentifier
      );
      const contentfulData =
        adminProposalNumber !== null
          ? umipsByNumber[adminProposalNumber]
          : undefined;
      if (!contentfulData) return vote;
      return {
        ...vote,
        contentfulData,
        // title and description for governance votes come from the UMIP entry
        ...getVoteMetaData(
          vote.decodedIdentifier,
          vote.decodedAncillaryData,
          contentfulData
        ),
      };
    });
  }, [votes, umipsByNumber]);
}
