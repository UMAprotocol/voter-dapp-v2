import assert from "assert";
import { useQuery } from "@tanstack/react-query";
import { augmentedVoteDataKey } from "constant";
import { getAugmentedVoteData } from "web3";
import { UseQueryOptions } from "@tanstack/react-query";
import { AugmentedVoteDataResponseT } from "types";

export function useAugmentedVoteData(
  params: Partial<{
    ancillaryData: string;
    time: number;
    identifier: string;
    queryOptions?: UseQueryOptions<AugmentedVoteDataResponseT, Error>;
  }>
) {
  return useQuery<AugmentedVoteDataResponseT, Error>({
    queryKey: [
      augmentedVoteDataKey,
      params.identifier,
      params.time,
      params.ancillaryData,
    ],
    queryFn: () => {
      assert(params.identifier, "identifier missing");
      assert(params.time, "time missing");
      assert(params.ancillaryData, "ancillaryData missing");
      return getAugmentedVoteData({
        identifier: params.identifier,
        time: params.time,
        ancillaryData: params.ancillaryData,
      });
    },
    enabled: !!params.identifier && !!params.time && !!params.ancillaryData,
    ...params?.queryOptions,
  });
}
