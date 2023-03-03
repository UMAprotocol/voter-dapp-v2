import { useQuery } from "@tanstack/react-query";
import { getDelegateSetEvents } from "chain";
import { sentRequestsToBeDelegateKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";

export function useSentRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [sentRequestsToBeDelegateKey, address],
    () => getDelegateSetEvents(voting, address, "delegator"),
    {
      enabled: !!address && !isWrongChain,
      onError,
    }
  );

  return queryResult;
}
