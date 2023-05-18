import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  stakedBalanceKey,
  stakerDetailsKey,
  unstakedBalanceKey,
} from "constant";
import { BigNumber } from "ethers";
import { useHandleError } from "hooks";
import { ErrorOriginT, StakerDetailsT } from "types";
import { executeUnstake } from "web3";

function max(a: BigNumber, b: BigNumber) {
  if (a.gt(b)) return a;
  return b;
}

export function useExecuteUnstake({
  address,
  errorOrigin,
}: {
  address: string | undefined;
  errorOrigin?: ErrorOriginT;
}) {
  const queryClient = useQueryClient();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation({
    mutationFn: executeUnstake,
    onError,
    onSuccess: (_contractReceipt, { pendingUnstake }) => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [unstakedBalanceKey, address],
        (oldUnstakedBalance) => {
          if (oldUnstakedBalance === undefined) return;

          const newUnstakedBalance = oldUnstakedBalance.add(pendingUnstake);

          return newUnstakedBalance;
        }
      );

      queryClient.setQueryData<BigNumber>(
        [stakedBalanceKey, address],
        (oldStakedBalance) => {
          if (oldStakedBalance === undefined) return;

          const newStakedBalance = max(
            BigNumber.from(0),
            oldStakedBalance.sub(pendingUnstake)
          );

          return newStakedBalance;
        }
      );

      queryClient.setQueryData<StakerDetailsT>(
        [stakerDetailsKey, address],
        (oldStakerDetails) =>
          oldStakerDetails
            ? {
                ...oldStakerDetails,
                pendingUnstake: BigNumber.from(0),
                canUnstakeTime: undefined,
              }
            : undefined
      );
    },
  });

  return {
    executeUnstakeMutation: mutate,
    isExecutingUnstake: isLoading,
  };
}
