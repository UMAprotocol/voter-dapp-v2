import { useQuery } from "@tanstack/react-query";
import { delegateSetEventsForDelegatorKey } from "constants/queryKeys";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegateSetEvents } from "web3";

export function useDelegateSetEventsForDelegator() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [delegateSetEventsForDelegatorKey, address],
    () => getDelegateSetEvents(voting, address, "delegator"),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: [],
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
