import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawAndRestake } from "chain";
import {
  outstandingRewardsKey,
  rewardsCalculationInputsKey,
  stakedBalanceKey,
} from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError, useStakingContext } from "hooks";
import { ErrorOriginT, RewardCalculationT } from "types";

export function useWithdrawAndRestake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { outstandingRewards } = useStakingContext();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation(withdrawAndRestake, {
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [stakedBalanceKey, address],
        (oldStakedBalance) => {
          // change outstanding rewards from contract to 0
          queryClient.setQueryData<BigNumber>(
            [outstandingRewardsKey, address],
            () => {
              return BigNumber.from(0);
            }
          );

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
            outstandingRewards === undefined ||
            oldStakedBalance === undefined
          )
            return;

          const newStakedBalance = oldStakedBalance.add(outstandingRewards);

          return newStakedBalance;
        }
      );
    },
  });

  return {
    withdrawAndRestakeMutation: mutate,
    isWithdrawingAndRestaking: isLoading,
  };
}
