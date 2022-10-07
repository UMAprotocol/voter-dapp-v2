import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, stakerDetailsKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { StakerDetailsT } from "types";
import { withdrawAndRestake } from "web3";

export function useWithdrawAndRestake(errorType?:string) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorType);

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
    onError,
  });
  return {
    withdrawAndRestakeMutation: mutate,
    isWithdrawingAndRestaking: isLoading,
  };
}
