import { useQuery } from "@tanstack/react-query";
import { delegateToStakerKey } from "constants/queryKeys";
import { zeroAddress } from "helpers";
import { useContractsContext, useHandleError, useStakingContext, useUserContext } from "hooks";
import { getDelegateToStaker } from "web3";

export function useDelegateToStaker() {
  const { voting } = useContractsContext();
  const { delegate } = useStakingContext();
  const { address } = useUserContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [delegateToStakerKey, address],
    () => getDelegateToStaker(voting, delegate ?? zeroAddress),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      onError,
    }
  );

  return queryResult;
}
