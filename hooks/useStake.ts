import { useMutation, useQueryClient } from "@tanstack/react-query";
import stake from "web3/mutations/stake";

export default function useStake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(stake, {
    onSuccess: (_data, { stakeAmount }) => {
      queryClient.setQueryData<number>(["stakedBalance"], Number(stakeAmount));
      queryClient.setQueryData<number>(["unstakedBalance"], (oldUnstakedBalance) =>
        oldUnstakedBalance ? oldUnstakedBalance - Number(stakeAmount) : oldUnstakedBalance
      );
    },
  });
  return mutate;
}
