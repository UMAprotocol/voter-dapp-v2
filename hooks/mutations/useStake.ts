import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakedBalanceKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber, ethers } from "ethers";
import { stake } from "web3/mutations";

export default function useStake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(stake, {
    onSuccess: (_data, { stakeAmount }) => {
      const parsedStakeAmount = ethers.utils.parseEther(stakeAmount);

      queryClient.setQueryData<[BigNumber]>([stakedBalanceKey], (oldStakedBalance) => {
        if (!oldStakedBalance) return undefined;

        const newStakedBalance = oldStakedBalance[0].add(parsedStakeAmount);
        return [newStakedBalance];
      });

      queryClient.setQueryData<[BigNumber]>([unstakedBalanceKey], (oldUnstakedBalance) => {
        if (!oldUnstakedBalance) return undefined;

        const newUnstakedBalance = oldUnstakedBalance[0].sub(parsedStakeAmount);
        return [newUnstakedBalance];
      });
    },
  });
  return mutate;
}
