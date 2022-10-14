import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sentRequestsToBeDelegateKey } from "constants/queryKeys";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { DelegationEventT } from "types/global";
import { removeDelegator } from "web3/mutations/delegation/removeDelegator";

export function useCancelSentRequestToBeDelegate() {
  const { address } = useUserContext();
  const onError = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(removeDelegator, {
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
