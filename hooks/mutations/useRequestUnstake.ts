import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakedBalanceKey, stakerDetailsKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import getCanUnstakeTime from "helpers/getCanUnstakeTime";
import { StakerDetailsT } from "types/global";
import { requestUnstake } from "web3/mutations";

export default function useRequestUnstake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(requestUnstake, {
    onSuccess: (_data, { unstakeAmount }) => {
      queryClient.setQueryData<BigNumber>([stakedBalanceKey], (oldStakedBalance) => {
        if (oldStakedBalance === undefined) return undefined;

        const newUnstakedBalance = oldStakedBalance.sub(unstakeAmount);

        return newUnstakedBalance;
      });

      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey], () => ({
        pendingUnstake: unstakeAmount,
        unstakeRequestTime: new Date(),
        canUnstakeTime: getCanUnstakeTime(new Date()),
      }));
    },
  });
  return mutate;
}
