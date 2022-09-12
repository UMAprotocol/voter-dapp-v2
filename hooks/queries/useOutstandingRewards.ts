import { useQuery } from "@tanstack/react-query";
import { outstandingRewardsKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getOutstandingRewards } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export function useOutstandingRewards() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery([outstandingRewardsKey], () =>
    getOutstandingRewards(voting, address)
  );

  return {
    outstandingRewards: data,
    outstandingRewardsIsLoading: isLoading,
    outstandingRewardsIsError: isError,
    outstandingRewardsError: error,
  };
}
