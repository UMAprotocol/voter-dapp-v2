import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateToStakerKey } from "constants/queryKeys";
import { zeroAddress } from "helpers";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { removeDelegate } from "web3/mutations/delegation/removeDelegate";

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
