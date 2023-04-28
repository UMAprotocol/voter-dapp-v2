import { useQuery } from "@tanstack/react-query";
import { assertionClaimsKey } from "constant";
import { useHandleError } from "hooks/helpers/useHandleError";
import { getAssertionClaims } from "web3/queries/votes/getAssertionClaims";

export function useAssertionClaims() {
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [assertionClaimsKey],
    queryFn: getAssertionClaims,
    initialData: {},
    onError,
  });

  return queryResult;
}
