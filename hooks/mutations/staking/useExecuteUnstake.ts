import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakedBalanceKey } from "constant/queryKeys";
import { BigNumber } from "ethers";
import { formatTransactionError } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT, StakerDetailsT } from "types";
import { executeUnstake } from "web3";

function max(a: BigNumber, b: BigNumber) {
  if (a.gt(b)) return a;
  return b;
}

export function useExecuteUnstake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorOrigin);

  const { mutate, isLoading } = useMutation(executeUnstake, {
    onSuccess: () => {
      queryClient.setQueryData<BigNumber>([unstakedBalanceKey, address], (oldUnstakedBalance) => {
        const oldStakerDetails = queryClient.getQueryData<StakerDetailsT>([stakerDetailsKey]);

        if (oldStakerDetails === undefined || oldUnstakedBalance === undefined) return;

        const newUnstakedBalance = oldUnstakedBalance.add(oldStakerDetails.pendingUnstake);

        return newUnstakedBalance;
      });

      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey, address], (oldStakerDetails) => {
        if (!oldStakerDetails) return;
        const newStakedBalance = max(
          BigNumber.from(0),
          oldStakerDetails.stakedBalance.sub(oldStakerDetails.pendingUnstake)
        );
        return {
          ...oldStakerDetails,
          stakedBalance: newStakedBalance,
          pendingUnstake: BigNumber.from(0),
          canUnstakeTime: undefined,
          unstakeRequestTime: undefined,
        };
      });
    },
    onError(error: unknown) {
      onError(formatTransactionError(error));
    },
  });

  return {
    executeUnstakeMutation: mutate,
    isExecutingUnstake: isLoading,
  };
}
