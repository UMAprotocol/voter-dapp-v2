import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateToStakerKey, sentRequestsToBeDelegateKey } from "constant/queryKeys";
import { zeroAddress } from "helpers";
import { useHandleError, useUserContext } from "hooks";
import { DelegationEventT } from "types";
import { removeDelegate } from "web3";

export function useTerminateRelationshipWithDelegate() {
  const onError = useHandleError();
  const { address } = useUserContext();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(removeDelegate, {
    onError,
    onSuccess: () => {
      queryClient.setQueryData<string>([delegateToStakerKey, address], () => zeroAddress);
      queryClient.setQueryData<DelegationEventT[]>([sentRequestsToBeDelegateKey, address], () => []);
    },
  });

  return {
    terminateRelationshipWithDelegateMutation: mutate,
    isTerminatingRelationshipWithDelegate: isLoading,
  };
}
