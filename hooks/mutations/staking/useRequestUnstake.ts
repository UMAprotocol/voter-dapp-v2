import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakeCoolDownKey } from "constant";
import { formatTransactionError, getCanUnstakeTime } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT, StakerDetailsT } from "types";
import { requestUnstake } from "web3";

export function useRequestUnstake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorOrigin);

  const { mutate, isLoading } = useMutation(requestUnstake, {
    onSuccess: (_data, { unstakeAmount }) => {
      queryClient.setQueryData<StakerDetailsT>(
        [stakerDetailsKey, address],
        (oldStakerDetails) => {
          if (oldStakerDetails === undefined) return;

          const unstakeCoolDown = queryClient.getQueryData<{
            unstakeCoolDown: number;
          }>([unstakeCoolDownKey]);

          if (
            unstakeCoolDown === undefined ||
            unstakeCoolDown.unstakeCoolDown === undefined
          )
            return;

          const newUnstakedBalance =
            oldStakerDetails.stakedBalance.sub(unstakeAmount);

          return {
            ...oldStakerDetails,
            stakedBalance: newUnstakedBalance,
            pendingUnstake: unstakeAmount,
            unstakeRequestTime: new Date(),
            canUnstakeTime: getCanUnstakeTime(
              new Date(),
              unstakeCoolDown.unstakeCoolDown
            ),
          };
        }
      );
    },
    onError(error: unknown) {
      onError(formatTransactionError(error));
    },
  });
  return {
    requestUnstakeMutation: mutate,
    isRequestingUnstake: isLoading,
  };
}
