import { useQuery } from "@tanstack/react-query";
import { getDesignatedVotingV1Address } from "helpers";

export function useDesignatedVotingV1Address(address: string) {
  return useQuery(
    ["designatedVotingV1Address", address],
    () => getDesignatedVotingV1Address(address),
    {
      enabled: !!address,
      initialData: undefined,
      onError: (err) =>
        console.error("Error fetching designated voting v1 address", err),
    }
  );
}
