import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventsForDelegatorKey } from "constants/queryKeys";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegator() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [delegatorSetEventsForDelegatorKey, address],
    () => getDelegatorSetEvents(voting, address, "delegator"),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: [],
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}