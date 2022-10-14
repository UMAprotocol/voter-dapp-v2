import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventsKey } from "constants/queryKeys";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [delegatorSetEventsKey, address],
    () => getDelegatorSetEvents(voting, address, "delegate"),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: [],
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
