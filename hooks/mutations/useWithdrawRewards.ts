import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { StakerDetailsT } from "types/global";
import withdrawRewards from "web3/mutations/withdrawRewards";

export default function useWithdrawRewards() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(withdrawRewards, {
    onSuccess: () => {
      queryClient.setQueryData<[BigNumber]>(["unstakedBalance"], (oldUnstakedBalance) => {
        const oldStakerDetails = queryClient.getQueryData<StakerDetailsT>(["stakerDetails"]);

        if (!oldStakerDetails || !oldUnstakedBalance) return undefined;

        const newUnstakedBalance = oldUnstakedBalance[0].add(oldStakerDetails.outstandingRewards);

        return [newUnstakedBalance];
      });

      queryClient.setQueryData<StakerDetailsT>(["stakerDetails"], (oldStakerDetails) => {
        if (!oldStakerDetails) return undefined;

        return {
          ...oldStakerDetails,
          outstandingRewards: BigNumber.from(0),
        };
      });
    },
  });
  return mutate;
}
