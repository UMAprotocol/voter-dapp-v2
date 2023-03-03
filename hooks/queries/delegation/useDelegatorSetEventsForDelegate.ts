import { useQuery } from "@tanstack/react-query";
import { getDelegatorSetEvents } from "chain";
import { delegatorSetEventForDelegateKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";

export function useDelegatorSetEventsForDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [delegatorSetEventForDelegateKey, address],
    () => getDelegatorSetEvents(voting, address, "delegate"),
    {
      enabled: !!address && !isWrongChain,
      onError,
    }
  );

  return queryResult;
}
