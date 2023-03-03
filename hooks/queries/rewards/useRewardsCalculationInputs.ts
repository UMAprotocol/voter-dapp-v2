import { useQuery } from "@tanstack/react-query";
import { getRewardsCalculationInputs } from "chain";
import { oneMinute, rewardsCalculationInputsKey } from "constant";
import { BigNumber } from "ethers";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";

export function useRewardsCalculationInputs(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery(
    [rewardsCalculationInputsKey, address],
    () => getRewardsCalculationInputs(voting),
    {
      refetchInterval: oneMinute,
      enabled: !!address && !isWrongChain,
      initialData: {
        emissionRate: BigNumber.from(0),
        rewardPerTokenStored: BigNumber.from(0),
        cumulativeStake: BigNumber.from(0),
        updateTime: BigNumber.from(Date.now()),
        updateTimeSeconds: BigNumber.from(Math.floor(Date.now() / 1000)),
      },
      onError,
    }
  );

  return queryResult;
}
