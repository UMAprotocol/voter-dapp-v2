import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BigNumber, ethers } from "ethers";
import requestUnstake from "web3/mutations/requestUnstake";

export default function useRequestUnstake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(requestUnstake, {
    onSuccess: (_data, { unstakeAmount }) => {
      const parsedUnstakeAmount = ethers.utils.parseEther(unstakeAmount);

      queryClient.setQueryData<[BigNumber]>(["stakedBalance"], (oldStakedBalance) => {
        if (!oldStakedBalance) return undefined;

        const newUnstakedBalance = oldStakedBalance[0].sub(parsedUnstakeAmount);
        return [newUnstakedBalance];
      });

      queryClient.setQueryData<[BigNumber]>(["pendingUnstakeBalance"], (oldPendingUnstakedBalance) => {
        if (!oldPendingUnstakedBalance) return undefined;

        const newUnstakedBalance = oldPendingUnstakedBalance[0].sub(parsedUnstakeAmount);
        return [newUnstakedBalance];
      });
    },
  });
  return mutate;
}
