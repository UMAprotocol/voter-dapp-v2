import { usePendingDelegationRequests } from "./usePendingDelegationRequests";

export function useSentRequestsToBeDelegate(address: string | undefined) {
  const { data, ...queryResult } = usePendingDelegationRequests(address);
  return { ...queryResult, data: data?.sent };
}
