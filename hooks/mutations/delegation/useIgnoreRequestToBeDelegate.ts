import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ignoredRequestToBeDelegateAddressesKey } from "constants/queryKeys";
import { getIgnoredRequestToBeDelegateAddressesFromStorage } from "helpers/getIgnoredRequestToBeDelegateAddressesFromStorage";
import { useUserContext } from "hooks/contexts/useUserContext";
import { useHandleError } from "hooks/helpers/useHandleError";

export function useIgnoreReceivedRequestToBeDelegate() {
  const { address } = useUserContext();
  const onError = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(ignoreReceivedRequestToBeDelegate, {
    onError,
    onSuccess: (_data, { delegatorAddress }) => {
      queryClient.setQueryData<string[]>(
        [ignoredRequestToBeDelegateAddressesKey, address],
        (oldIgnoredRequestToBeDelegateAddresses) => {
          if (!oldIgnoredRequestToBeDelegateAddresses) return;

          const newIgnoredRequestToBeDelegateAddresses = [...oldIgnoredRequestToBeDelegateAddresses, delegatorAddress];

          return newIgnoredRequestToBeDelegateAddresses;
        }
      );
    },
  });

  return {
    ignoreReceivedRequestToBeDelegateMutation: mutate,
    isIgnoringRequestToBeDelegate: isLoading,
  };
}

async function ignoreReceivedRequestToBeDelegate({
  userAddress,
  delegatorAddress,
}: {
  userAddress: string;
  delegatorAddress: string;
}) {
  const ignoredRequestToBeDelegateAddresses = getIgnoredRequestToBeDelegateAddressesFromStorage();

  if (!ignoredRequestToBeDelegateAddresses[userAddress]?.includes(delegatorAddress)) {
    if (!ignoredRequestToBeDelegateAddresses[userAddress]) {
      ignoredRequestToBeDelegateAddresses[userAddress] = [];
    }
    ignoredRequestToBeDelegateAddresses[userAddress].push(delegatorAddress);
    window.localStorage.setItem(
      "ignoredRequestToBeDelegateAddresses",
      JSON.stringify(ignoredRequestToBeDelegateAddresses)
    );
  }
}
