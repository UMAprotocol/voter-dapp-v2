import { useQuery } from "@tanstack/react-query";
import { ignoredRequestToBeDelegateAddressesKey } from "constants/queryKeys";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { getIgnoredRequestToBeDelegateAddresses } from "web3/queries/delegation/getIgnoredRequestToBeDelegateAddresses";

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
