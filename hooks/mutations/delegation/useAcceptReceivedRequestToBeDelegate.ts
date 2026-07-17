import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateToStakerKey, voterFromDelegateKey } from "constant";
import { useHandleError } from "hooks";
import { setDelegator } from "web3";

export function useAcceptReceivedRequestToBeDelegate(
  address: string | undefined
) {
  const { onError, clearErrors } = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: setDelegator,
    onError,
    onSuccess: (_data, { delegatorAddress }) => {
      clearErrors();

      queryClient.setQueryData<string>(
        [voterFromDelegateKey, address],
        () => delegatorAddress
      );

      // the delegateToStaker cache is keyed by (address, delegate) — refetch
      // whatever entries exist rather than guessing the key
      void queryClient.invalidateQueries([delegateToStakerKey]);
    },
  });

  return {
    acceptReceivedRequestToBeDelegateMutation: mutate,
    isAcceptingReceivedRequestToBeDelegate: isLoading,
  };
}
