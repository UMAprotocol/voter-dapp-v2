import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakerDetailsKey, unstakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { StakerDetailsT } from "types/global";
import { stake } from "web3/mutations";

export default function useStake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(stake, {
    onSuccess: (_data, { stakeAmount }) => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey], (oldStakerDetails) => {
        if (oldStakerDetails === undefined) return;

        const newStakedBalance = oldStakerDetails.stakedBalance.add(stakeAmount);

        return {
          ...oldStakerDetails,
          stakedBalance: newStakedBalance,
        };
      });

      queryClient.setQueryData<BigNumber>([unstakedBalanceKey], (oldUnstakedBalance) => {
        if (oldUnstakedBalance === undefined) return;

        const newUnstakedBalance = oldUnstakedBalance.sub(stakeAmount);

        return newUnstakedBalance;
      });
    },
  });
  return mutate;
}
