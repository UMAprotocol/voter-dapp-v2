import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, unstakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT } from "types";
import { withdrawRewards } from "web3";

export function useWithdrawRewards(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation(withdrawRewards, {
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [unstakedBalanceKey, address],
        (oldUnstakedBalance) => {
          const outstandingRewards = queryClient.getQueryData<BigNumber>([
            outstandingRewardsKey,
          ]);

          if (
            outstandingRewards === undefined ||
            oldUnstakedBalance === undefined
          )
            return;

          const newUnstakedBalance = oldUnstakedBalance.add(outstandingRewards);

          return newUnstakedBalance;
        }
      );

      queryClient.setQueryData<BigNumber>(
        [outstandingRewardsKey, address],
        () => BigNumber.from(0)
      );
    },
  });

  return {
    withdrawRewardsMutation: mutate,
    isWithdrawingRewards: isLoading,
  };
}
