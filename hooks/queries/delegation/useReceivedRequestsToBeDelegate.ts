import { useQuery } from "@tanstack/react-query";
import { receivedRequestsToBeDelegateKey } from "constants/queryKeys";
import { useContractsContext, useHandleError, useIgnoredRequestToBeDelegateAddresses, useUserContext } from "hooks";
import { getDelegateSetEvents } from "web3";

export function useReceivedRequestsToBeDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const onError = useHandleError();
  const { data: ignoredRequestToBeDelegateAddresses } = useIgnoredRequestToBeDelegateAddresses();

  const queryResult = useQuery(
    [receivedRequestsToBeDelegateKey, address],
    () =>
      getDelegateSetEvents(voting, address, "delegate").then((events) =>
        events.filter((event) => !ignoredRequestToBeDelegateAddresses?.includes(event.delegator))
      ),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: [],
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
