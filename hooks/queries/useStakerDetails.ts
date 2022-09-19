import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getStakerDetails } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useStakerDetails() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery([stakerDetailsKey], () => getStakerDetails(voting, address), {
    refetchInterval: (data) => (data ? false : 100),
  });

  const { pendingUnstake, unstakeRequestTime, canUnstakeTime } = data ?? {};

  return {
    pendingUnstake,
    unstakeRequestTime,
    canUnstakeTime,
    stakerDetailsIsLoading: isLoading,
    stakerDetailsIsError: isError,
    stakerDetailsError: error,
  };
}
