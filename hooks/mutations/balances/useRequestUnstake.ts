import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey } from "constants/queryKeys";
import { getCanUnstakeTime } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { StakerDetailsT } from "types";
import { requestUnstake } from "web3";

export default function useRequestUnstake() {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError();

  const { mutate, isLoading } = useMutation(requestUnstake, {
    onSuccess: (_data, { unstakeAmount }) => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey, address], (oldStakerDetails) => {
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
    onError,
  });
  return {
    requestUnstakeMutation: mutate,
    isRequestingUnstake: isLoading,
  };
}
