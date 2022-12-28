import { useQuery } from "@tanstack/react-query";
import { outstandingRewardsKey } from "constant";
import { BigNumber } from "ethers";
import { useContractsContext, useHandleError, useUserContext } from "hooks";
import { getOutstandingRewards } from "web3";

export function useOutstandingRewards(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useUserContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery(
    [outstandingRewardsKey, address],
    () => getOutstandingRewards(voting, address),
    {
      enabled: !!address,
      initialData: BigNumber.from(0),
      onError,
    }
  );

  return queryResult;
}
