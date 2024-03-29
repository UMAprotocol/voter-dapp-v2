import { useQuery } from "@tanstack/react-query";
import { unstakeCoolDownKey } from "constant";
import { useContractsContext, useHandleError } from "hooks";
import { getUnstakeCoolDown } from "web3";

export function useUnstakeCoolDown() {
  const { voting } = useContractsContext();
  const { onError } = useHandleError({ isDataFetching: true });
  // only need to fetch this one time
  const queryResult = useQuery({
    queryKey: [unstakeCoolDownKey],
    queryFn: () => getUnstakeCoolDown(voting),
    onError,
  });

  return queryResult;
}
