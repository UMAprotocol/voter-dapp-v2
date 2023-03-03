import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setDelegator } from "chain";
import { delegateToStakerKey, voterFromDelegateKey } from "constant";
import { useHandleError, useUserContext } from "hooks";

export function useAcceptReceivedRequestToBeDelegate() {
  const { address } = useUserContext();
  const { onError, clearErrors } = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(setDelegator, {
    onError,
    onSuccess: (_data, { delegatorAddress }) => {
      clearErrors();

      queryClient.setQueryData<string>(
        [voterFromDelegateKey, address],
        () => delegatorAddress
      );

      queryClient.setQueryData<string>(
        [delegateToStakerKey, address],
        () => address
      );
    },
  });

  return {
    acceptReceivedRequestToBeDelegateMutation: mutate,
    isAcceptingReceivedRequestToBeDelegate: isLoading,
  };
}
