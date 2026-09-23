import { useQuery } from "@tanstack/react-query";
import { ignoredRequestToBeDelegateAddressesKey } from "constant";
import { useHandleError, useWalletContext } from "hooks";
import { getIgnoredRequestToBeDelegateAddresses } from "web3";

export function useIgnoredRequestToBeDelegateAddresses(
  address: string | undefined
) {
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [ignoredRequestToBeDelegateAddressesKey, address],
    queryFn: () => getIgnoredRequestToBeDelegateAddresses(address),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
