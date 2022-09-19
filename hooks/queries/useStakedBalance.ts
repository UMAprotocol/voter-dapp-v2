import { useQuery } from "@tanstack/react-query";
import { stakedBalanceKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getStakedBalance } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useStakedBalance() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { isLoading, isError, data, error } = useQuery([stakedBalanceKey], () => getStakedBalance(voting, address), {
    refetchInterval(data) {
      return data ? false : 100;
    },
  });

  return {
    stakedBalance: data,
    stakedBalanceIsLoading: isLoading,
    stakedBalanceIsError: isError,
    stakedBalanceError: error,
  };
}
