import { useQuery, useQueryClient } from "@tanstack/react-query";
import { delegationRequestsKey } from "constant";
import {
  useHandleError,
  useNewReceivedRequestsToBeDelegate,
  useWalletContext,
} from "hooks";
import { DelegationRequestsResponse } from "pages/api/delegation-requests";
import { useEffect } from "react";

/**
 * Pending delegation requests (both directions) come from a server endpoint:
 * enumerating inbound requests needs a full-history DelegateSet scan, which
 * the server provider can do in one topic-filtered call while range-capped
 * client providers cannot. Everything else about delegation status derives
 * from direct contract reads.
 */
export function usePendingDelegationRequests(address: string | undefined) {
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const queryClient = useQueryClient();
  const newRequests = useNewReceivedRequestsToBeDelegate(address);

  // a live DelegateSet subscription signals a new inbound request — refetch
  // rather than keying on the counter so mutations can write into the cache
  useEffect(() => {
    if (newRequests === 0) return;
    void queryClient.invalidateQueries([delegationRequestsKey, address]);
  }, [newRequests, address, queryClient]);

  const queryResult = useQuery({
    queryKey: [delegationRequestsKey, address],
    queryFn: async (): Promise<DelegationRequestsResponse> => {
      const params = new URLSearchParams({ address: address ?? "" });
      const response = await fetch(
        `/api/delegation-requests?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(
          `Fetching delegation requests failed with status ${response.status}`
        );
      }
      return (await response.json()) as DelegationRequestsResponse;
    },
    enabled: !!address && !isWrongChain,
    onError,
  });

  // disabled queries (e.g. before the wallet connects) report isLoading=true
  // forever in react-query v4; isInitialLoading is only true while actually fetching
  return { ...queryResult, isLoading: queryResult.isInitialLoading };
}
