import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rewardsCalculationInputsKey,
  stakedBalanceKey,
  stakerDetailsKey,
} from "constant";
import { BigNumber } from "ethers";
import { useHandleError, useStakerDetails } from "hooks";
import { ErrorOriginT, RewardCalculationT, StakerDetailsT } from "types";
import { withdrawAndRestake } from "web3";

export function useWithdrawAndRestake(
  address: string,
  errorOrigin?: ErrorOriginT
) {
  const queryClient = useQueryClient();
  const { data: stakerDetails } = useStakerDetails(address);
  const { outstandingRewards } = stakerDetails || {};
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation({
    mutationFn: withdrawAndRestake,
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [stakedBalanceKey, address],
        (oldStakedBalance) => {
          // change outstanding rewards from contract to 0
          queryClient.setQueryData<StakerDetailsT>(
            [stakerDetailsKey, address],
            (oldDetails) => {
              if (oldDetails === undefined) return oldDetails;
              return {
                ...oldDetails,
                outstandingRewards: BigNumber.from(0),
              };
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
