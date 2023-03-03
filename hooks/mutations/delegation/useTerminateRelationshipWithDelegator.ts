import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeDelegator } from "chain";
import { voterFromDelegateKey } from "constant";
import { useHandleError, useUserContext } from "hooks";

export function useTerminateRelationshipWithDelegator() {
  const { address } = useUserContext();
  const queryClient = useQueryClient();
  const { onError, clearErrors } = useHandleError();

  const { mutate, isLoading } = useMutation(removeDelegator, {
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
