import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeDelegate } from "chain";
import { sentRequestsToBeDelegateKey } from "constant";
import { useHandleError, useUserContext } from "hooks";
import { DelegationEventT } from "types";

export function useCancelSentRequestToBeDelegate() {
  const { address } = useUserContext();
  const { onError, clearErrors } = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(removeDelegate, {
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
