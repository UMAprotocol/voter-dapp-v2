import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { approve } from "web3";
import { formatTransactionError } from "helpers";

export function useApprove(errorType?: string) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorType);

  const { mutate, isLoading } = useMutation(approve, {
    onSuccess: (_data, { approveAmount }) => {
      queryClient.setQueryData<BigNumber>([tokenAllowanceKey, address], (oldTokenAllowance) => {
        if (oldTokenAllowance === undefined) return;

        const newTokenAllowance = oldTokenAllowance.add(approveAmount);
        return newTokenAllowance;
      });
    },
    onError(error: unknown) {
      onError(formatTransactionError(error));
    },
  });
  return {
    approveMutation: mutate,
    isApproving: isLoading,
  };
}
