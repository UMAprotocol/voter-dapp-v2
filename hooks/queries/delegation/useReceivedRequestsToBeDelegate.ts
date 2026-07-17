import { usePendingDelegationRequests } from "./usePendingDelegationRequests";

export function useReceivedRequestsToBeDelegate(address: string | undefined) {
  const { data, ...queryResult } = usePendingDelegationRequests(address);
  return { ...queryResult, data: data?.received };
}
