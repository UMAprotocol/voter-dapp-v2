import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventsForDelegatorKey } from "constant";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegator() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [delegatorSetEventsForDelegatorKey, address],
    () => getDelegatorSetEvents(voting, address, "delegator"),
    {
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
