import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constant/queryKeys";
import { useHandleError, useUserContext } from "hooks";
import { removeDelegator } from "web3";

export function useTerminateRelationshipWithDelegator() {
  const onError = useHandleError();
  const { address } = useUserContext();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(removeDelegator, {
    onError,
    onSuccess: () => {
      queryClient.setQueryData<string>([voterFromDelegateKey, address], () => address);
    },
  });

  return {
    terminateRelationshipWithDelegatorMutation: mutate,
    isTerminatingRelationshipWithDelegator: isLoading,
  };
}
