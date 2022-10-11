import { useQuery } from "@tanstack/react-query";
import { delegateToStakerKey } from "constants/queryKeys";
import { zeroAddress } from "helpers";
import { useContractsContext, useStakingContext } from "hooks";
import { getDelegateToStaker } from "web3";

export function useDelegateToStaker() {
  const { voting } = useContractsContext();
  const { delegate } = useStakingContext();

  const queryResult = useQuery(
    [delegateToStakerKey, delegate],
    () => getDelegateToStaker(voting, delegate ?? zeroAddress),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: zeroAddress,
    }
  );

  return queryResult;
}
