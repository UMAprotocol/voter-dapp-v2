import { useQuery } from "@tanstack/react-query";
import { oneMinute, userDataKey } from "constant";
import { getUserData } from "graph";
import { config } from "helpers/config";
import { useAccountDetails, useHandleError, useWalletContext } from "hooks";

export function useUserVotingAndStakingDetails(addressOverride?: string) {
  const { address: defaultAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery({
    queryKey: [userDataKey, address],
    queryFn: () => getUserData(address),
    enabled: !!address && !isWrongChain && config.graphV2Enabled,
    refetchInterval: oneMinute,
    onError,
  });

  return queryResult;
}
