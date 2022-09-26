import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outstandingRewardsKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useAccountDetails } from "hooks/queries";
import { withdrawRewards } from "web3/mutations";

export default function useWithdrawRewards() {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();

  const { mutate, isLoading } = useMutation(withdrawRewards, {
    onSuccess: () => {
      queryClient.setQueryData<BigNumber>([unstakedBalanceKey, address], (oldUnstakedBalance) => {
        const outstandingRewards = queryClient.getQueryData<BigNumber>([outstandingRewardsKey]);

        if (outstandingRewards === undefined || oldUnstakedBalance === undefined) return;

        const newUnstakedBalance = oldUnstakedBalance.add(outstandingRewards);

        return newUnstakedBalance;
      });

      queryClient.setQueryData<BigNumber>([outstandingRewardsKey, address], () => BigNumber.from(0));
    },
  });

  return {
    withdrawRewardsMutation: mutate,
    isWithdrawingRewards: isLoading,
  };
}
