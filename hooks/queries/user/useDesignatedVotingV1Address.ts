import { useQuery } from "@tanstack/react-query";
import { getDesignatedVotingV1Address } from "helpers";
import { useWalletContext } from "hooks";

export function useDesignatedVotingV1Address(address: string | undefined) {
  const { isWrongChain } = useWalletContext();
  return useQuery({
    queryKey: ["designatedVotingV1Address", address],
    queryFn: () => getDesignatedVotingV1Address(address),
    enabled: !isWrongChain,
    onError: (err) =>
      console.error("Error fetching designated voting v1 address", err),
  });
}
