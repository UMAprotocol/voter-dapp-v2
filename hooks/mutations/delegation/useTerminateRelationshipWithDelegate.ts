import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateToStakerKey } from "constants/queryKeys";
import { zeroAddress } from "helpers";
import { useHandleError, useUserContext } from "hooks";
import { removeDelegate } from "web3";

export function useTerminateRelationshipWithDelegate() {
  const onError = useHandleError();
  const { address } = useUserContext();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(removeDelegate, {
    onError,
    onSuccess: () => {
      queryClient.setQueryData<string>([delegateToStakerKey, address], () => zeroAddress);
    },
  });

  return {
    terminateRelationshipWithDelegateMutation: mutate,
    isTerminatingRelationshipWithDelegate: isLoading,
  };
}