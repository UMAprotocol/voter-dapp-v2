import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sentRequestsToBeDelegateKey } from "constant";
import { useHandleError, useUserContext } from "hooks";
import { DelegationEventT } from "types";
import { removeDelegate } from "web3";

export function useCancelSentRequestToBeDelegate() {
  const { address } = useUserContext();
  const onError = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(removeDelegate, {
    onError,
    onSuccess: () => {
      queryClient.setQueryData<DelegationEventT[]>([sentRequestsToBeDelegateKey, address], () => {
        return [];
      });
    },
  });

  return {
    cancelSentRequestToBeDelegateMutation: mutate,
    isCancelingSentRequestToBeDelegate: isLoading,
  };
}
