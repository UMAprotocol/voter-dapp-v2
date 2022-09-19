import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { approve } from "web3/mutations";

export default function useApprove() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(approve, {
    onSuccess: (_data, { approveAmount }) => {
      queryClient.setQueryData<BigNumber>([tokenAllowanceKey], (oldTokenAllowance) => {
        if (oldTokenAllowance === undefined) return;

        const newTokenAllowance = oldTokenAllowance.add(approveAmount);
        return newTokenAllowance;
      });
    },
  });
  return mutate;
}
