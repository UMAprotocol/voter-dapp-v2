import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakedBalanceKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { stake } from "web3/mutations";

export default function useStake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(stake, {
    onSuccess: (_data, { stakeAmount }) => {
      queryClient.setQueryData<BigNumber>([stakedBalanceKey], (oldStakedBalance) => {
        if (oldStakedBalance === undefined) return;

        const newStakedBalance = oldStakedBalance.add(stakeAmount);

        return newStakedBalance;
      });

      queryClient.setQueryData<BigNumber>([unstakedBalanceKey], (oldUnstakedBalance) => {
        if (oldUnstakedBalance === undefined) return;

        const newUnstakedBalance = oldUnstakedBalance.sub(stakeAmount);

        return newUnstakedBalance;
      });
    },
  });
  return mutate;
}
