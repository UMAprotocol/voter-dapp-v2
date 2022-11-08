import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, stakerDetailsKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT, StakerDetailsT } from "types";
import { withdrawAndRestake } from "web3";

export function useWithdrawAndRestake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation(withdrawAndRestake, {
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<StakerDetailsT>(
        [stakerDetailsKey, address],
        (oldStakerDetails) => {
          const outstandingRewards = queryClient.getQueryData<BigNumber>([
            outstandingRewardsKey,
          ]);

          if (
            outstandingRewards === undefined ||
            oldStakerDetails === undefined
          )
            return;

          const newStakedBalance =
            oldStakerDetails.stakedBalance.add(outstandingRewards);

          return {
            ...oldStakerDetails,
            stakedBalance: newStakedBalance,
          };
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
