import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { StakerDetailsT } from "types";
import { executeUnstake } from "web3";

export function useExecuteUnstake(errorType?:string) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorType);

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

        const newStakedBalance = oldStakerDetails.stakedBalance.sub(oldStakerDetails.pendingUnstake);
        return {
          stakedBalance: newStakedBalance,
          pendingUnstake: BigNumber.from(0),
          canUnstakeTime: undefined,
          unstakeRequestTime: undefined,
        };
      });
    },
    onError,
  });

  return {
    executeUnstakeMutation: mutate,
    isExecutingUnstake: isLoading,
  };
}
