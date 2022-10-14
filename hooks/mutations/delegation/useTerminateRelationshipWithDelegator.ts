import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constants/queryKeys";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { removeDelegator } from "web3/mutations/delegation/removeDelegator";

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
