import { useQuery } from "@tanstack/react-query";
import { getDelegatorSetEvents } from "chain";
import { delegatorSetEventsForDelegatorKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";

export function useDelegatorSetEventsForDelegator() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [delegatorSetEventsForDelegatorKey, address],
    () => getDelegatorSetEvents(voting, address, "delegator"),
    {
      enabled: !!address && !isWrongChain,
      onError,
    }
  );

  return queryResult;
}
