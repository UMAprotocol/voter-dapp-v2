import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstakedBalanceKey, outstandingRewardsKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError, useStakingContext } from "hooks";
import { ErrorOriginT } from "types";
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
          if (
            oldUnstakedBalance === undefined ||
            outstandingRewards === undefined
          )
            return;

          const newUnstakedBalance = oldUnstakedBalance.add(outstandingRewards);

          // change outstnading rewards from contract to 0
          queryClient.setQueryData<BigNumber>(
            [outstandingRewardsKey, address],
            () => BigNumber.from(0)
          );
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
