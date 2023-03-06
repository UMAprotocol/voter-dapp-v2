import { useQuery } from "@tanstack/react-query";
import { getDesignatedVotingV1Address } from "helpers";
import { useWalletContext } from "hooks";

export function useDesignatedVotingV1Address(address: string) {
  const { isWrongChain } = useWalletContext();
  return useQuery(
    ["designatedVotingV1Address", address],
    () => getDesignatedVotingV1Address(address),
    {
      enabled: !!address && !isWrongChain,
      initialData: undefined,
      onError: (err) =>
        console.error("Error fetching designated voting v1 address", err),
    }
  );
}
