import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestUnstake } from "chain";
import {
  stakedBalanceKey,
  stakerDetailsKey,
  unstakeCoolDownKey,
} from "constant";
import { BigNumber } from "ethers";
import { getCanUnstakeTime } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT, StakerDetailsT } from "types";

export function useRequestUnstake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation(requestUnstake, {
    onError,
    onSuccess: (_contractReceipt, { unstakeAmount }) => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [stakedBalanceKey, address],
        (oldStakedBalance) => {
          if (oldStakedBalance === undefined) return;

          const newStakedBalance = oldStakedBalance.sub(unstakeAmount);

          return newStakedBalance;
        }
      );

      queryClient.setQueryData<StakerDetailsT>(
        [stakerDetailsKey, address],
        (oldStakerDetails) => {
          if (oldStakerDetails === undefined) return;

          const unstakeCoolDown = queryClient.getQueryData<BigNumber>([
            unstakeCoolDownKey,
          ]);

          if (unstakeCoolDown === undefined) return;

          return {
            ...oldStakerDetails,
            pendingUnstake: unstakeAmount,
            canUnstakeTime: getCanUnstakeTime(
              new Date(),
              unstakeCoolDown.toNumber()
            ),
          };
        }
      );
    },
  });
  return {
    requestUnstakeMutation: mutate,
    isRequestingUnstake: isLoading,
  };
}
