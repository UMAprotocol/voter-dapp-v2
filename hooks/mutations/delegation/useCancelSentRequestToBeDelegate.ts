import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationRequestsKey } from "constant";
import { useHandleError } from "hooks";
import { DelegationRequestsResponse } from "pages/api/delegation-requests";
import { removeDelegate } from "web3";

export function useCancelSentRequestToBeDelegate(address: string | undefined) {
  const { onError, clearErrors } = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: removeDelegate,
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<DelegationRequestsResponse>(
        [delegationRequestsKey, address],
        (old) => ({ received: old?.received ?? [], sent: [] })
      );
    },
  });

  return {
    cancelSentRequestToBeDelegateMutation: mutate,
    isCancelingSentRequestToBeDelegate: isLoading,
  };
}
