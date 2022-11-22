import { useQuery } from "@tanstack/react-query";
import { ignoredRequestToBeDelegateAddressesKey } from "constant";
import { useHandleError, useUserContext } from "hooks";
import { getIgnoredRequestToBeDelegateAddresses } from "web3";

export function useIgnoredRequestToBeDelegateAddresses() {
  const { address } = useUserContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [ignoredRequestToBeDelegateAddressesKey, address],
    () => getIgnoredRequestToBeDelegateAddresses(address),
    {
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
