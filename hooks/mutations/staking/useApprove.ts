import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { formatTransactionError } from "helpers";
import { useAccountDetails, useHandleError } from "hooks";
import { ErrorOriginT } from "types";
import { approve } from "web3";

export function useApprove(errorOrigin?: ErrorOriginT) {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const onError = useHandleError(errorOrigin);

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
