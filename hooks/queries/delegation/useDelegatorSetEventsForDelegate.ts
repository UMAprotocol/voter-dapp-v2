import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventForDelegateKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegate(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [delegatorSetEventForDelegateKey, address],
    queryFn: () => getDelegatorSetEvents(voting, address, "delegate"),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
