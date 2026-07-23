import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  delegateToStakerKey,
  delegationRequestsKey,
  stakerDetailsKey,
} from "constant";
import { zeroAddress } from "helpers";
import { useHandleError } from "hooks";
import { DelegationRequestsResponse } from "pages/api/delegation-requests";
import { StakerDetailsT } from "types";
import { removeDelegate } from "web3";

export function useTerminateRelationshipWithDelegate(
  address: string | undefined
) {
  const queryClient = useQueryClient();
  const { onError, clearErrors } = useHandleError();

  const { mutate, isLoading } = useMutation({
    mutationFn: removeDelegate,
    onError,
    onSuccess: () => {
      clearErrors();

      // removeDelegate clears voterStakes(address).delegate on chain; with no
      // delegate set, the (address, delegate)-keyed delegateToStaker query is
      // disabled and delegation status falls out of "delegator" immediately
      queryClient.setQueryData<StakerDetailsT>(
        [stakerDetailsKey, address],
        (oldStakerDetails) => {
          if (!oldStakerDetails) return;
          return { ...oldStakerDetails, delegate: zeroAddress };
        }
      );
      void queryClient.invalidateQueries([delegateToStakerKey]);
      queryClient.setQueryData<DelegationRequestsResponse>(
        [delegationRequestsKey, address],
        (old) => ({ received: old?.received ?? [], sent: [] })
      );
    },
  });

  return {
    terminateRelationshipWithDelegateMutation: mutate,
    isTerminatingRelationshipWithDelegate: isLoading,
  };
}
