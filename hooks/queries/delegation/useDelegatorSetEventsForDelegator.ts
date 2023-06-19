import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventsForDelegatorKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegator(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [delegatorSetEventsForDelegatorKey, address],
    queryFn: () => getDelegatorSetEvents(voting, address, "delegator"),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
