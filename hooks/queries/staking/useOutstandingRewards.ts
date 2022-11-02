import { useQuery } from "@tanstack/react-query";
import { outstandingRewardsKey } from "constant/queryKeys";
import { BigNumber } from "ethers";
import { useAccountDetails, useContractsContext, useHandleError } from "hooks";
import { getOutstandingRewards } from "web3";

export function useOutstandingRewards() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const onError = useHandleError();

  const queryResult = useQuery([outstandingRewardsKey, address], () => getOutstandingRewards(voting, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    initialData: BigNumber.from(0),
    onError,
  });

  return queryResult;
}
