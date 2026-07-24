import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sentRequestsToBeDelegateKey, stakerDetailsKey } from "constant";
import { useHandleError } from "hooks";
import { DelegationEventT, ErrorOriginT, StakerDetailsT } from "types";
import { setDelegate } from "web3";

export function useSendRequestToBeDelegate({
  address,
  errorOrigin,
}: {
  address: string | undefined;
  errorOrigin?: ErrorOriginT;
}) {
  const { onError, clearErrors } = useHandleError({ errorOrigin });
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: setDelegate,
    onError,
    onSuccess: ({ transactionHash }, { delegateAddress }) => {
      clearErrors();

      queryClient.setQueryData<StakerDetailsT>(
        [stakerDetailsKey, address],
        (oldStakerDetails) => {
          if (!oldStakerDetails) return;

          return {
            ...oldStakerDetails,
            delegate: delegateAddress,
          };
        }
      );

      queryClient.setQueryData<DelegationEventT[]>(
        [sentRequestsToBeDelegateKey, address],
        () => {
          if (!address) return;

          return [
            {
              delegate: delegateAddress,
              delegator: address,
              transactionHash,
            },
          ];
        }
      );
    },
  });

  return {
    sendRequestToBeDelegateMutation: mutate,
    isSendingRequestToBeDelegate: isLoading,
  };
}
