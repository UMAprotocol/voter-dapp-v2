import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, stakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT } from "types";
import { withdrawAndRestake } from "web3";

export function useWithdrawAndRestake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation(withdrawAndRestake, {
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [stakedBalanceKey, address],
        (oldStakedBalance) => {
          const outstandingRewards = queryClient.getQueryData<BigNumber>([
            outstandingRewardsKey,
          ]);

          if (
            outstandingRewards === undefined ||
            oldStakedBalance === undefined
          )
            return;

          const newStakedBalance = oldStakedBalance.add(outstandingRewards);

          return newStakedBalance;
        }
      );

      queryClient.setQueryData<BigNumber>(
        [outstandingRewardsKey, address],
        () => BigNumber.from(0)
      );
    },
  });
  return {
    withdrawAndRestakeMutation: mutate,
    isWithdrawingAndRestaking: isLoading,
  };
}
