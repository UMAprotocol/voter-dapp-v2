import { useQuery } from "@tanstack/react-query";
import { assertionClaimsKey } from "constant";
import { useHandleError } from "hooks";
import { getAssertionClaim } from "web3";
import { config } from "helpers/config";

export function useAssertionClaim(
  chainId: number = config.chainId,
  assertionId?: string
) {
  const { onError } = useHandleError({ isDataFetching: true });
  const queryResult = useQuery({
    queryKey: [assertionClaimsKey, chainId, assertionId],
    queryFn: () => {
      return getAssertionClaim(chainId, assertionId);
    },
    enabled: !!assertionId,
    onError,
  });

  return queryResult;
}
