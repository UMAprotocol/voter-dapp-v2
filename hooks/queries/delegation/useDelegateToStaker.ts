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
    queryKey: [delegateToStakerKey, address],
    queryFn: () => getDelegateToStaker(voting, delegate ?? zeroAddress),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
