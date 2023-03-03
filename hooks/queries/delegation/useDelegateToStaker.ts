import { useQuery } from "@tanstack/react-query";
import { getDelegateToStaker } from "chain";
import { delegateToStakerKey } from "constant";
import { zeroAddress } from "helpers";
import {
  useContractsContext,
  useHandleError,
  useStakerDetails,
  useUserContext,
  useWalletContext,
} from "hooks";

export function useDelegateToStaker() {
  const { voting } = useContractsContext();
  const {
    data: { delegate },
  } = useStakerDetails();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [delegateToStakerKey, address],
    () => getDelegateToStaker(voting, delegate ?? zeroAddress),
    {
      enabled: !!address && !isWrongChain,
      onError,
    }
  );

  return queryResult;
}
