import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey } from "constants/queryKeys";
import getCanUnstakeTime from "helpers/getCanUnstakeTime";
import { StakerDetailsT } from "types/global";
import { requestUnstake } from "web3/mutations";

export default function useRequestUnstake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(requestUnstake, {
    onSuccess: (_data, { unstakeAmount }) => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey], (oldStakerDetails) => {
        if (oldStakerDetails === undefined) return;

        const newUnstakedBalance = oldStakerDetails.stakedBalance.sub(unstakeAmount);

        return {
          stakedBalance: newUnstakedBalance,
          pendingUnstake: unstakeAmount,
          unstakeRequestTime: new Date(),
          canUnstakeTime: getCanUnstakeTime(new Date()),
        };
      });
    },
  });
  return mutate;
}
