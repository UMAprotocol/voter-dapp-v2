import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { StakerDetailsT } from "types";
import { stake } from "web3";

export function useStake(errorType?:string) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorType);

  const { mutate, isLoading } = useMutation(stake, {
    onSuccess: (_data, { stakeAmount }) => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey, address], (oldStakerDetails) => {
        if (oldStakerDetails === undefined) return;

        const newStakedBalance = oldStakerDetails.stakedBalance.add(stakeAmount);

        return {
          ...oldStakerDetails,
          stakedBalance: newStakedBalance,
        };
      });

      queryClient.setQueryData<BigNumber>([unstakedBalanceKey, address], (oldUnstakedBalance) => {
        if (oldUnstakedBalance === undefined) return;

        const newUnstakedBalance = oldUnstakedBalance.sub(stakeAmount);

        return newUnstakedBalance;
      });
    },
    onError,
  });
  return {
    stakeMutation: mutate,
    isStaking: isLoading,
  };
}
