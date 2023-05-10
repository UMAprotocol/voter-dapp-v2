import { useQuery } from "@tanstack/react-query";
import { delegatorSetEventForDelegateKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";
import { getDelegatorSetEvents } from "web3";

export function useDelegatorSetEventsForDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
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
