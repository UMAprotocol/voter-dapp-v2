import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakeCoolDownKey } from "constants/queryKeys";
import { getCanUnstakeTime } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { StakerDetailsT } from "types";
import { requestUnstake } from "web3";

export function useRequestUnstake(errorType?: string) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorType);

  const { mutate, isLoading } = useMutation(requestUnstake, {
    onSuccess: (_data, { unstakeAmount }) => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey, address], (oldStakerDetails) => {
        if (oldStakerDetails === undefined) return;

        const unstakeCoolDown = queryClient.getQueryData<{ unstakeCoolDown: number }>([unstakeCoolDownKey]);

        if (unstakeCoolDown === undefined || unstakeCoolDown.unstakeCoolDown === undefined) return;

        const newUnstakedBalance = oldStakerDetails.stakedBalance.sub(unstakeAmount);

        return {
          ...oldStakerDetails,
          stakedBalance: newUnstakedBalance,
          pendingUnstake: unstakeAmount,
          unstakeRequestTime: new Date(),
          canUnstakeTime: getCanUnstakeTime(new Date(), unstakeCoolDown.unstakeCoolDown),
        };
      });
    },
    onError,
  });
  return {
    requestUnstakeMutation: mutate,
    isRequestingUnstake: isLoading,
  };
}
