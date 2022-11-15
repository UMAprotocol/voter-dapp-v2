import { useQuery } from "@tanstack/react-query";
import { outstandingRewardsKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useContractsContext, useHandleError } from "hooks";
import { getOutstandingRewards } from "web3";

export function useOutstandingRewards() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { onError } = useHandleError({ isDataFetching: true });

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
