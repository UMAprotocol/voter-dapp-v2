import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, stakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { withdrawAndRestake } from "web3/mutations";

export default function useWithdrawAndRestake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(withdrawAndRestake, {
    onSuccess: () => {
      queryClient.setQueryData<BigNumber>([stakedBalanceKey], (oldStakedBalance) => {
        const outstandingRewards = queryClient.getQueryData<BigNumber>([outstandingRewardsKey]);

        if (outstandingRewards === undefined || oldStakedBalance === undefined) return;

        const newStakedBalance = oldStakedBalance.add(outstandingRewards);

        return newStakedBalance;
      });

      queryClient.setQueryData<BigNumber>([outstandingRewardsKey], () => BigNumber.from(0));
    },
  });
  return mutate;
}
