import { useQuery } from "@tanstack/react-query";
import { outstandingRewardsKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts";
import { useHandleError } from "hooks/helpers";
import getOutstandingRewards from "web3/queries/getOutstandingRewards";
import useAccountDetails from "./useAccountDetails";

export default function useOutstandingRewards() {
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
