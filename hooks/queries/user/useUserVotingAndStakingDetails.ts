import { useQuery } from "@tanstack/react-query";
import { oneMinute, userDataKey } from "constant";
import { getUserData } from "graph";
import { config } from "helpers/config";
import { useHandleError, useWalletContext } from "hooks";

export function useUserVotingAndStakingDetails(address: string | undefined) {
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [userDataKey, address],
    queryFn: () => getUserData(address),
    enabled: !isWrongChain && config.graphV2Enabled,
    refetchInterval: oneMinute,
    onError,
  });

  return queryResult;
}
