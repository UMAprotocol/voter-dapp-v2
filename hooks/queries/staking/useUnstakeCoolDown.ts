import { useQuery } from "@tanstack/react-query";
import { getUnstakeCoolDown } from "chain";
import { unstakeCoolDownKey } from "constant";
import { BigNumber } from "ethers";
import { useContractsContext, useHandleError } from "hooks";

export function useUnstakeCoolDown() {
  const { voting } = useContractsContext();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });
  // only need to fetch this one time
  const queryResult = useQuery({
    queryKey: [unstakeCoolDownKey],
    queryFn: () => getUnstakeCoolDown(voting),
    initialData: BigNumber.from(0),
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
