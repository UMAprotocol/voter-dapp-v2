import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  unstakedBalanceKey,
  outstandingRewardsKey,
  rewardsCalculationInputsKey,
} from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError, useStakingContext } from "hooks";
import { ErrorOriginT, RewardCalculationT } from "types";
import { withdrawRewards } from "web3";

export function useWithdrawRewards(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { outstandingRewards } = useStakingContext();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation(withdrawRewards, {
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [unstakedBalanceKey, address],
        (oldUnstakedBalance) => {
          // change outstanding rewards from contract to 0
          queryClient.setQueryData<BigNumber>(
            [outstandingRewardsKey, address],
            () => BigNumber.from(0)
          );
          // change our update time to calculate the correct new rewards based on amount staked
          // this happens every minute on an interval
          queryClient.setQueryData<RewardCalculationT>(
            [rewardsCalculationInputsKey, address],
            (previous) => {
              return {
                emissionRate: BigNumber.from(0),
                rewardPerTokenStored: BigNumber.from(0),
                cumulativeStake: BigNumber.from(0),
                ...previous,
                updateTime: BigNumber.from(Date.now()),
              };
            }
          );
          if (
            oldUnstakedBalance === undefined ||
            outstandingRewards === undefined
          )
            return;

          const newUnstakedBalance = oldUnstakedBalance.add(outstandingRewards);
          return newUnstakedBalance;
        }
      );
    },
  });

  return {
    withdrawRewardsMutation: mutate,
    isWithdrawingRewards: isLoading,
  };
}
