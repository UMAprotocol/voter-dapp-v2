import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constant";
import { useHandleError, useUserContext } from "hooks";
import { removeDelegator } from "web3";

export function useTerminateRelationshipWithDelegator() {
  const { address } = useUserContext();
  const queryClient = useQueryClient();
  const { onError, clearErrors } = useHandleError();

  const { mutate, isLoading } = useMutation({
    mutationFn: removeDelegator,
    onError,
    onSuccess: () => {
      clearErrors();

      queryClient.setQueryData<string>(
        [voterFromDelegateKey, address],
        () => address
      );
    },
  });

  return {
    terminateRelationshipWithDelegatorMutation: mutate,
    isTerminatingRelationshipWithDelegator: isLoading,
  };
}
