import { useQuery } from "@tanstack/react-query";
import { oneMinute, rewardsCalculationInputsKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getRewardsCalculationInputs } from "web3";

export function useRewardsCalculationInputs() {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [rewardsCalculationInputsKey],
    queryFn: () => getRewardsCalculationInputs(voting),
    refetchInterval: oneMinute,
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
