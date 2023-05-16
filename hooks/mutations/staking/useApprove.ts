import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constant";
import { BigNumber } from "ethers";
import { useHandleError } from "hooks";
import { ErrorOriginT } from "types";
import { approve } from "web3";

export function useApprove(
  address: string | undefined,
  errorOrigin?: ErrorOriginT
) {
  const queryClient = useQueryClient();
  const { onError, clearErrors } = useHandleError({ errorOrigin });

  const { mutate, isLoading } = useMutation({
    mutationFn: approve,
    onError,
    onSuccess: (_data, { approveAmount }) => {
      clearErrors();

      queryClient.setQueryData<BigNumber>(
        [tokenAllowanceKey, address],
        (oldTokenAllowance) => {
          if (oldTokenAllowance === undefined) return;

          const newTokenAllowance = oldTokenAllowance.add(approveAmount);
          return newTokenAllowance;
        }
      );
    },
  });
  return {
    approveMutation: mutate,
    isApproving: isLoading,
  };
}
