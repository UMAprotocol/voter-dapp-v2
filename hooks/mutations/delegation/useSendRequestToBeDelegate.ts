import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationRequestsKey, stakerDetailsKey } from "constant";
import { useHandleError } from "hooks";
import { DelegationRequestsResponse } from "pages/api/delegation-requests";
import { ErrorOriginT, StakerDetailsT } from "types";
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

      queryClient.setQueryData<DelegationRequestsResponse>(
        [delegationRequestsKey, address],
        (old) => {
          if (!address) return;

          return {
            received: old?.received ?? [],
            sent: [
              {
                delegate: delegateAddress,
                delegator: address,
                transactionHash,
              },
            ],
          };
        }
      );
    },
  });

  return {
    sendRequestToBeDelegateMutation: mutate,
    isSendingRequestToBeDelegate: isLoading,
  };
}
