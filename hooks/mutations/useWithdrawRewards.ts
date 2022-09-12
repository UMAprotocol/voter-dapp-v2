import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, unstakedBalanceKey } from "constants/queryKeys";
import { withdrawRewards } from "web3/mutations";

export default function useWithdrawRewards() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(withdrawRewards, {
    onSuccess: () => {
      queryClient.setQueryData<number>([unstakedBalanceKey], (oldUnstakedBalance) => {
        const outstandingRewards = queryClient.getQueryData<number>([outstandingRewardsKey]);

        if (outstandingRewards === undefined || oldUnstakedBalance === undefined) return undefined;

        const newUnstakedBalance = oldUnstakedBalance + outstandingRewards;

        return newUnstakedBalance;
      });

      queryClient.setQueryData<number>([outstandingRewardsKey], () => 0);
    },
  });

  return mutate;
}
