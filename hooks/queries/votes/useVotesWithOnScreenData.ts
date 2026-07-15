import { VoteT } from "types";
import { useVotesWithResolvedAncillaryData } from "./useVotesWithResolvedAncillaryData";
import { useVotesWithUmipData } from "./useVotesWithUmipData";

/**
 * Enrichment that is intentionally deferred until a vote is actually on
 * screen: L2 ancillary data resolution (titles for bridged requests) and UMIP
 * metadata from contentful (titles/descriptions for governance votes). Wrap
 * whatever slice of votes a component renders — rows, a page, a panel's vote.
 */
export function useVotesWithOnScreenData(votes: VoteT[]): VoteT[] {
  // ancillary first: governance metadata does not depend on it, but keeping a
  // fixed order means both hooks see stable inputs
  return useVotesWithUmipData(useVotesWithResolvedAncillaryData(votes));
}
