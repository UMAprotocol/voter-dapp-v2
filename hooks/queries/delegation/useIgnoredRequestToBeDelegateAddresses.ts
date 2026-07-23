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
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
