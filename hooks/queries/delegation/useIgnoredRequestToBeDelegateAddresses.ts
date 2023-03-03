import { useQuery } from "@tanstack/react-query";
import { getIgnoredRequestToBeDelegateAddresses } from "chain";
import { ignoredRequestToBeDelegateAddressesKey } from "constant";
import { useHandleError, useUserContext, useWalletContext } from "hooks";

export function useIgnoredRequestToBeDelegateAddresses() {
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [ignoredRequestToBeDelegateAddressesKey, address],
    () => getIgnoredRequestToBeDelegateAddresses(address),
    {
      enabled: !!address && !isWrongChain,
      onError,
    }
  );

  return queryResult;
}
