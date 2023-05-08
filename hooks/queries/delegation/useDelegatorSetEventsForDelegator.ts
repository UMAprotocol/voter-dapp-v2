import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventsForDelegatorKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegator() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [delegatorSetEventsForDelegatorKey, address],
    queryFn: () => getDelegatorSetEvents(voting, address, "delegator"),
    enabled: !!address && !isWrongChain,
    onError,
  });

  return queryResult;
}
