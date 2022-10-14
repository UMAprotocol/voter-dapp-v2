import { useMutation } from "@tanstack/react-query";
import { useHandleError } from "hooks/helpers/useHandleError";
import { setDelegate } from "web3";

export function useSendRequestToBeDelegate(errorType?: string) {
  const onError = useHandleError(errorType);

  const { mutate, isLoading } = useMutation(setDelegate, {
    onError,
  });

  return {
    sendRequestToBeDelegateMutation: mutate,
    isSendingRequestToBeDelegate: isLoading,
  };
}
