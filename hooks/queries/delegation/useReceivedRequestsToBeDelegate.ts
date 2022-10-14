import { useQuery } from "@tanstack/react-query";
import { delegateSetEventsKey } from "constants/queryKeys";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegateSetEvents } from "web3";

export function useReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [delegateSetEventsKey, address],
    () => getDelegateSetEvents(voting, address, "delegate"),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: [],
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
