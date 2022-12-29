import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakedBalanceKey, outstandingRewardsKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError, useStakingContext } from "hooks";
import { ErrorOriginT } from "types";
import { withdrawAndRestake } from "web3";

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
          if (
            outstandingRewards === undefined ||
            oldStakedBalance === undefined
          )
            return;

          const newStakedBalance = oldStakedBalance.add(outstandingRewards);

          // change outstnading rewards from contract to 0
          queryClient.setQueryData<BigNumber>(
            [outstandingRewardsKey, address],
            () => BigNumber.from(0)
          );

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
