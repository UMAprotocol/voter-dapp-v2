import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sentRequestsToBeDelegateKey, stakerDetailsKey } from "constants/queryKeys";
import { useHandleError, useUserContext } from "hooks";
import { DelegationEventT, ErrorOriginT, StakerDetailsT } from "types";
import { setDelegate } from "web3";

export function useSendRequestToBeDelegate(errorOrigin?: ErrorOriginT) {
  const { address } = useUserContext();
  const onError = useHandleError(errorOrigin);
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(setDelegate, {
    onError,
    onSuccess: ({ transactionHash }, { delegateAddress }) => {
      queryClient.setQueryData<StakerDetailsT>([stakerDetailsKey, address], (oldStakerDetails) => {
        if (!oldStakerDetails) return;

        return {
          ...oldStakerDetails,
          delegate: delegateAddress,
        };
      });
      queryClient.setQueryData<DelegationEventT[]>([sentRequestsToBeDelegateKey, address], () => [
        {
          delegate: delegateAddress,
          delegator: address,
          transactionHash,
        },
      ]);
    },
  });

  return {
    sendRequestToBeDelegateMutation: mutate,
    isSendingRequestToBeDelegate: isLoading,
  };
}
