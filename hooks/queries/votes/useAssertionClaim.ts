import { useQuery } from "@tanstack/react-query";
import { assertionClaimsKey } from "constant";
import { useHandleError } from "hooks";
import { getAssertionClaim, getInstance } from "web3";

export function useAssertionClaim(chainId?: number, assertionId?: string) {
  const { onError } = useHandleError({ isDataFetching: true });
  const queryResult = useQuery({
    queryKey: [assertionClaimsKey, chainId, assertionId],
    queryFn: () => {
      const instance = getInstance(chainId!);
      return getAssertionClaim(instance, assertionId!);
    },
    initialData: undefined,
    enabled: !!chainId && !!assertionId,
    onError,
  });

  return queryResult;
}
