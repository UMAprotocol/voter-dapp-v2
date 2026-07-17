import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateToStakerKey, delegationRequestsKey } from "constant";
import { zeroAddress } from "helpers";
import { useHandleError } from "hooks";
import { DelegationRequestsResponse } from "pages/api/delegation-requests";
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
      queryClient.setQueryData<DelegationRequestsResponse>(
        [delegationRequestsKey, address],
        (old) => ({ received: old?.received ?? [], sent: [] })
      );
    },
  });

  return {
    terminateRelationshipWithDelegateMutation: mutate,
    isTerminatingRelationshipWithDelegate: isLoading,
  };
}
