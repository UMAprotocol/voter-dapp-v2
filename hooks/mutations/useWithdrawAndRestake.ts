import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, stakerDetailsKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { StakerDetailsT } from "types/global";
import { withdrawAndRestake } from "web3/mutations";

export default function useWithdrawAndRestake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(withdrawAndRestake, {
    onSuccess: () => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey], (oldStakerDetails) => {
        const outstandingRewards = queryClient.getQueryData<BigNumber>([outstandingRewardsKey]);

        if (outstandingRewards === undefined || oldStakerDetails === undefined) return;

        const newStakedBalance = oldStakerDetails.stakedBalance.add(outstandingRewards);

        return {
          ...oldStakerDetails,
          stakedBalance: newStakedBalance,
        };
      });

      queryClient.setQueryData<BigNumber>([outstandingRewardsKey], () => BigNumber.from(0));
    },
  });
  return mutate;
}
