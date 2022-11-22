import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventForDelegateKey } from "constant";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [delegatorSetEventForDelegateKey, address],
    () => getDelegatorSetEvents(voting, address, "delegate"),
    {
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
