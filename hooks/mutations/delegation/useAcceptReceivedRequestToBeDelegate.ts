import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateToStakerKey, voterFromDelegateKey } from "constants/queryKeys";
import { useHandleError, useUserContext } from "hooks";
import { setDelegator } from "web3";

export function useAcceptReceivedRequestToBeDelegate() {
  const { address } = useUserContext();
  const onError = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(setDelegator, {
    onError,
    onSuccess: (_data, { delegatorAddress }) => {
      queryClient.setQueryData<string>([voterFromDelegateKey, address], () => delegatorAddress);
      queryClient.setQueryData<string>([delegateToStakerKey, address], () => address);
    },
  });

  return {
    acceptReceivedRequestToBeDelegateMutation: mutate,
    isAcceptingReceivedRequestToBeDelegate: isLoading,
  };
}