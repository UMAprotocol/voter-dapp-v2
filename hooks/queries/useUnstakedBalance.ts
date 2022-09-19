import { useQuery } from "@tanstack/react-query";
import { unstakedBalanceKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getUnstakedBalance } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useUnstakedBalance() {
  const { votingToken } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [unstakedBalanceKey],
    () => getUnstakedBalance(votingToken, address),
    {
      refetchInterval(data) {
        return data ? false : 100;
      },
    }
  );

  return {
    unstakedBalance: data,
    unstakedBalanceIsLoading: isLoading,
    unstakedBalanceIsError: isError,
    unstakedBalanceError: error,
  };
}
