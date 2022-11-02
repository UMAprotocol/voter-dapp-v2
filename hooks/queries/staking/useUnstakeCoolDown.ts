import { useQuery } from "@tanstack/react-query";
import { unstakeCoolDownKey } from "constant";
import { useContractsContext, useHandleError } from "hooks";
import { getUnstakeCoolDown } from "web3";

export function useUnstakeCoolDown() {
  const { voting } = useContractsContext();
  const onError = useHandleError();
  // only need to fetch this one time
  const queryResult = useQuery(
    [unstakeCoolDownKey],
    () => getUnstakeCoolDown(voting),
    {
      initialData: {
        unstakeCoolDown: 0,
      },
      onError,
    }
  );

  return queryResult;
}
