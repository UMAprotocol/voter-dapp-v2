import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { approve } from "web3";

export function useApprove() {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError();

  const { mutate, isLoading } = useMutation(approve, {
    onSuccess: (_data, { approveAmount }) => {
      queryClient.setQueryData<BigNumber>([tokenAllowanceKey, address], (oldTokenAllowance) => {
        if (oldTokenAllowance === undefined) return;

        const newTokenAllowance = oldTokenAllowance.add(approveAmount);
        return newTokenAllowance;
      });
    },
    onError,
  });
  return {
    approveMutation: mutate,
    isApproving: isLoading,
  };
}
