import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, stakedBalanceKey } from "constants/queryKeys";
import { withdrawAndRestake } from "web3/mutations";

export default function useWithdrawAndRestake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(withdrawAndRestake, {
    onSuccess: () => {
      queryClient.setQueryData<number>([stakedBalanceKey], (oldStakedBalance) => {
        const outstandingRewards = queryClient.getQueryData<number>([outstandingRewardsKey]);

        if (outstandingRewards === undefined || oldStakedBalance === undefined) return undefined;

        const newStakedBalance = oldStakedBalance + outstandingRewards;

        return newStakedBalance;
      });

      queryClient.setQueryData<number>([outstandingRewardsKey], () => 0);
    },
  });

  return mutate;
}
