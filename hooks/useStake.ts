import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BigNumber, ethers } from "ethers";
import stake from "web3/mutations/stake";

export default function useStake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(stake, {
    onSuccess: (_data, { stakeAmount }) => {
      const parsedStakeAmount = ethers.utils.parseEther(stakeAmount);

      queryClient.setQueryData<[BigNumber]>(["stakedBalance"], (oldStakedBalance) => {
        if (!oldStakedBalance) return undefined;

        const newStakedBalance = oldStakedBalance[0].add(parsedStakeAmount);
        return [newStakedBalance];
      });

      queryClient.setQueryData<[BigNumber]>(["unstakedBalance"], (oldUnstakedBalance) => {
        if (!oldUnstakedBalance) return undefined;

        const newUnstakedBalance = oldUnstakedBalance[0].sub(parsedStakeAmount);
        return [newUnstakedBalance];
      });
    },
  });
  return mutate;
}
