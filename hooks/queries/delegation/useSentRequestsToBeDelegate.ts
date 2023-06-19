import { useQuery } from "@tanstack/react-query";
import { sentRequestsToBeDelegateKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getDelegateSetEvents } from "web3";

export function useSentRequestsToBeDelegate(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [sentRequestsToBeDelegateKey, address],
    queryFn: () => getDelegateSetEvents(voting, address, "delegator"),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
