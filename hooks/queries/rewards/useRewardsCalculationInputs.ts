import { useQuery } from "@tanstack/react-query";
import { oneMinute, rewardsCalculationInputsKey } from "constant";
import { BigNumber } from "ethers";
import {
  useContractsContext,
  useHandleError,
  useStakingContext,
  useUserContext,
} from "hooks";
import { getRewardsCalculationInputs } from "web3";

export function useRewardsCalculationInputs() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { stakedBalance, unstakedBalance, pendingUnstake, updateTime } =
    useStakingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [
      rewardsCalculationInputsKey,
      address,
      stakedBalance,
      unstakedBalance,
      pendingUnstake,
      updateTime,
    ],
    () => getRewardsCalculationInputs(voting),
    {
      refetchInterval: oneMinute,
      enabled: !!address,
      initialData: {
        emissionRate: BigNumber.from(0),
        rewardPerTokenStored: BigNumber.from(0),
        cumulativeStake: BigNumber.from(0),
        updateTime: BigNumber.from(0),
      },
      onError,
    }
  );

  return queryResult;
}
