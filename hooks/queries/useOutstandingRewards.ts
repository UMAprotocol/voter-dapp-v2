import { useQuery } from "@tanstack/react-query";
import { outstandingRewardsKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import getOutstandingRewards from "web3/queries/getOutstandingRewards";
import useAccountDetails from "./useAccountDetails";

export default function useOutstandingRewards() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const queryResult = useQuery([outstandingRewardsKey], () => getOutstandingRewards(voting, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
  });

  return queryResult;
}
