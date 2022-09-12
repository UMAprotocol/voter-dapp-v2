import { useQuery } from "@tanstack/react-query";
import { VotingTokenEthers } from "@uma/contracts-frontend";
import { unstakedBalanceKey } from "constants/queryKeys";
import { getUnstakedBalance } from "web3/queries";

export default function useUnstakedBalance(votingTokenContract: VotingTokenEthers, address: string) {
  const { isLoading, isError, data, error } = useQuery(
    [unstakedBalanceKey],
    () => getUnstakedBalance(votingTokenContract, address),
    {
      refetchInterval(data) {
        return data ? false : 1000;
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
