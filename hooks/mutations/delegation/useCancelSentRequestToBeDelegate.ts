import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationRequestsKey, stakerDetailsKey } from "constant";
import { zeroAddress } from "helpers";
import { useHandleError } from "hooks";
import { DelegationRequestsResponse } from "pages/api/delegation-requests";
import { StakerDetailsT } from "types";
import { removeDelegate } from "web3";

export function useCancelSentRequestToBeDelegate(address: string | undefined) {
  const { onError, clearErrors } = useHandleError();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: removeDelegate,
    onError,
    onSuccess: () => {
      clearErrors();

      // removeDelegate clears voterStakes(address).delegate on chain
      queryClient.setQueryData<StakerDetailsT>(
        [stakerDetailsKey, address],
        (oldStakerDetails) => {
          if (!oldStakerDetails) return;
          return { ...oldStakerDetails, delegate: zeroAddress };
        }
      );
      queryClient.setQueryData<DelegationRequestsResponse>(
        [delegationRequestsKey, address],
        (old) => ({ received: old?.received ?? [], sent: [] })
      );
    },
  });

  return {
    cancelSentRequestToBeDelegateMutation: mutate,
    isCancelingSentRequestToBeDelegate: isLoading,
  };
}
