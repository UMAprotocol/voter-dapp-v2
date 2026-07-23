import { useQuery } from "@tanstack/react-query";
import { delegateToStakerKey } from "constant";
import { zeroAddress } from "helpers";
import {
  useContractsContext,
  useHandleError,
  useStakerDetails,
  useWalletContext,
} from "hooks";
import { getDelegateToStaker } from "web3";

export function useDelegateToStaker(address: string | undefined) {
  const { voting } = useContractsContext();
  const { data: stakerDetails } = useStakerDetails(address);
  const { delegate } = stakerDetails ?? {};
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    // the delegate is an input to the lookup, so it belongs in the key —
    // switching delegates must not serve the old delegate's cached answer
    queryKey: [delegateToStakerKey, address, delegate],
    queryFn: () => getDelegateToStaker(voting, delegate ?? zeroAddress),
    // delegate comes from useStakerDetails — don't fire until it resolves
    enabled: !!delegate && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
