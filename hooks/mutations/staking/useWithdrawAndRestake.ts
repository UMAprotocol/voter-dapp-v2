import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, stakerDetailsKey } from "constant";
import { BigNumber } from "ethers";
import { formatTransactionError } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT, StakerDetailsT } from "types";
import { withdrawAndRestake } from "web3";

export function useWithdrawAndRestake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorOrigin);

  const { mutate, isLoading } = useMutation(withdrawAndRestake, {
    onSuccess: () => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey, address], (oldStakerDetails) => {
        const outstandingRewards = queryClient.getQueryData<BigNumber>([outstandingRewardsKey]);

        if (outstandingRewards === undefined || oldStakerDetails === undefined) return;

        const newStakedBalance = oldStakerDetails.stakedBalance.add(outstandingRewards);

        return {
          ...oldStakerDetails,
          stakedBalance: newStakedBalance,
        };
      });

      queryClient.setQueryData<BigNumber>([outstandingRewardsKey, address], () => BigNumber.from(0));
    },
    onError(error: unknown) {
      onError(formatTransactionError(error));
    },
  });
  return {
    withdrawAndRestakeMutation: mutate,
    isWithdrawingAndRestaking: isLoading,
  };
}
