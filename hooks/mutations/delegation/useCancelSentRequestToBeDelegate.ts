import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sentRequestsToBeDelegateKey } from "constant";
import { useHandleError } from "hooks";
import { DelegationEventT } from "types";
import { removeDelegate } from "web3";

export function useCancelSentRequestToBeDelegate(address: string | undefined) {
  const { onError, clearErrors } = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: removeDelegate,
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<DelegationEventT[]>(
        [sentRequestsToBeDelegateKey, address],
        () => {
          return [];
        }
      );
    },
  });

  return {
    cancelSentRequestToBeDelegateMutation: mutate,
    isCancelingSentRequestToBeDelegate: isLoading,
  };
}
