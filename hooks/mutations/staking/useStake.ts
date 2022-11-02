import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import { formatTransactionError } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT, StakerDetailsT } from "types";
import { stake } from "web3";

export function useStake(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorOrigin);

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
    onError(error: unknown) {
      onError(formatTransactionError(error));
    },
  });
  return {
    stakeMutation: mutate,
    isStaking: isLoading,
  };
}
