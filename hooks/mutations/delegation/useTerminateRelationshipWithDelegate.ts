import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateToStakerKey, sentRequestsToBeDelegateKey } from "constant";
import { zeroAddress } from "helpers";
import { useHandleError } from "hooks";
import { DelegationEventT } from "types";
import { removeDelegate } from "web3";

export function useTerminateRelationshipWithDelegate(
  address: string | undefined
) {
  const queryClient = useQueryClient();
  const { onError, clearErrors } = useHandleError();

  const { mutate, isLoading } = useMutation({
    mutationFn: removeDelegate,
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<string>(
        [delegateToStakerKey, address],
        () => zeroAddress
      );
      queryClient.setQueryData<DelegationEventT[]>(
        [sentRequestsToBeDelegateKey, address],
        () => []
      );
    },
  });

  return {
    terminateRelationshipWithDelegateMutation: mutate,
    isTerminatingRelationshipWithDelegate: isLoading,
  };
}
