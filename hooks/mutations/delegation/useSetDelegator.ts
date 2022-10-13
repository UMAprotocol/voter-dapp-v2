import { useMutation } from "@tanstack/react-query";
import { useHandleError } from "hooks/helpers/useHandleError";
import { setDelegator } from "web3";

export function useSetDelegator(errorType?: string) {
  const onError = useHandleError(errorType);

  const { mutate, isLoading } = useMutation(setDelegator, {
    onError,
  });

  return {
    setDelegatorMutation: mutate,
    isSettingDelegator: isLoading,
  };
}
