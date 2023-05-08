import { useQuery } from "@tanstack/react-query";
import { oneMinute, rewardsCalculationInputsKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";
import { getRewardsCalculationInputs } from "web3";

export function useRewardsCalculationInputs(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [rewardsCalculationInputsKey, address],
    queryFn: () => getRewardsCalculationInputs(voting),
    refetchInterval: oneMinute,
    enabled: !!address && !isWrongChain,
    onError,
  });

  return queryResult;
}
