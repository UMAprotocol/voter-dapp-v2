import { useAugmentedVoteData } from "hooks/queries/votes/useAugmentedVoteData";

/**
 * An OOV3 assertion's claim comes from the augmented vote data (the server
 * resolves it from the OOV3 subgraph on the assertion's origin chain), which
 * the vote panel fetches anyway — the shared query key means at most one
 * request per vote. This replaced a client-side AssertionMade event scan over
 * a million blocks, which range-capped RPC providers reject outright.
 */
export function useAssertionClaim(params: {
  time?: number;
  decodedIdentifier?: string;
  ancillaryDataL2?: string;
  assertionId?: string;
}) {
  const { data, ...queryResult } = useAugmentedVoteData({
    time: params.time,
    identifier: params.decodedIdentifier,
    ancillaryData: params.ancillaryDataL2,
    // only OOV3-originated votes have a claim — don't fetch for the rest.
    // queryOptions.enabled replaces the base hook's guard, so restate it
    queryOptions: {
      enabled:
        !!params.assertionId &&
        !!params.time &&
        !!params.decodedIdentifier &&
        !!params.ancillaryDataL2,
      staleTime: Infinity,
    },
  });

  return { ...queryResult, data: data?.optimisticOracleV3Data?.claim };
}
