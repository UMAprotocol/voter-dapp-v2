import { useQuery } from "@tanstack/react-query";
import { ignoredRequestToBeDelegateAddressesKey } from "constant/queryKeys";
import { useHandleError, useUserContext } from "hooks";
import { getIgnoredRequestToBeDelegateAddresses } from "web3";

export function useIgnoredRequestToBeDelegateAddresses() {
  const { address } = useUserContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [ignoredRequestToBeDelegateAddressesKey, address],
    () => getIgnoredRequestToBeDelegateAddresses(address),
    {
      enabled: !!address,
      refetchInterval: (data) => (data ? false : 100),
      onError,
    }
  );

  return queryResult;
}
