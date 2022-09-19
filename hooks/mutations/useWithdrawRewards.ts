import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { withdrawRewards } from "web3/mutations";

export default function useWithdrawRewards() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(withdrawRewards, {
    onSuccess: () => {
      queryClient.setQueryData<BigNumber>([unstakedBalanceKey], (oldUnstakedBalance) => {
        const outstandingRewards = queryClient.getQueryData<BigNumber>([outstandingRewardsKey]);

        if (outstandingRewards === undefined || oldUnstakedBalance === undefined) return;

        const newUnstakedBalance = oldUnstakedBalance.add(outstandingRewards);

        return newUnstakedBalance;
      });

      queryClient.setQueryData<BigNumber>([outstandingRewardsKey], () => BigNumber.from(0));
    },
  });

  return mutate;
}
