import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BigNumber, ethers } from "ethers";
import { UnstakeDetailsT } from "types/global";
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

      queryClient.setQueryData<UnstakeDetailsT>(["unstakeDetails"], (oldUnstakeDetails) => {
        if (!oldUnstakeDetails) return undefined;

        return {
          ...oldUnstakeDetails,
          activeStake: oldUnstakeDetails.activeStake.sub(parsedUnstakeAmount),
          pendingUnstake: BigNumber.from(parsedUnstakeAmount),
          unstakeRequestTime: BigNumber.from(Date.now() / 1000),
        };
      });
    },
  });
  return mutate;
}
