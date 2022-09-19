import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { StakerDetailsT } from "types/global";
import { executeUnstake } from "web3/mutations";

export default function useExecuteUnstake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(executeUnstake, {
    onSuccess: () => {
      queryClient.setQueryData<BigNumber>([unstakedBalanceKey], (oldUnstakedBalance) => {
        const oldStakerDetails = queryClient.getQueryData<StakerDetailsT>([stakerDetailsKey]);

        if (oldStakerDetails === undefined || oldUnstakedBalance === undefined) return;

        const newUnstakedBalance = oldUnstakedBalance.add(oldStakerDetails.pendingUnstake);

        return newUnstakedBalance;
      });

      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey], () => ({
        pendingUnstake: BigNumber.from(0),
        canUnstakeTime: undefined,
        unstakeRequestTime: undefined,
      }));
    },
  });

  return mutate;
}
