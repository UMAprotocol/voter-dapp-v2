import { useQuery } from "@tanstack/react-query";
import { delegateToStakerKey } from "constant";
import { zeroAddress } from "helpers";
import {
  useContractsContext,
  useHandleError,
  useStakerDetails,
  useUserContext,
  useWalletContext,
} from "hooks";
import { getDelegateToStaker } from "web3";

export function useDelegateToStaker() {
  const { voting } = useContractsContext();
  const { data: stakerDetails } = useStakerDetails();
  const { delegate } = stakerDetails ?? {};
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [delegateToStakerKey, address],
    queryFn: () => getDelegateToStaker(voting, delegate ?? zeroAddress),
    enabled: !!address && !isWrongChain,
    onError,
  });

  return queryResult;
}
