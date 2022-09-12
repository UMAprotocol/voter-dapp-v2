import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { StakerDetailsT } from "types/global";
import { withdrawAndRestake } from "web3/mutations";

export default function useWithdrawAndRestake() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(withdrawAndRestake, {
    onSuccess: () => {
      queryClient.setQueryData<[BigNumber]>(["stakedBalance"], (oldStakedBalance) => {
        const oldStakerDetails = queryClient.getQueryData<StakerDetailsT>(["stakerDetails"]);

        if (!oldStakerDetails || !oldStakedBalance) return undefined;

        const newStakedBalance = oldStakedBalance[0].add(oldStakerDetails.outstandingRewards);

        return [newStakedBalance];
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
