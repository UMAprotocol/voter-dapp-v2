import { useQuery } from "@tanstack/react-query";
import { sentRequestsToBeDelegateKey } from "constants/queryKeys";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getDelegateSetEvents } from "web3";

export function useSentRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [sentRequestsToBeDelegateKey, address],
    () => getDelegateSetEvents(voting, address, "delegator"),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: [],
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
