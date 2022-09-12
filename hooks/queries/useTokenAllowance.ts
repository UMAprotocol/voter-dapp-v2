import { useQuery } from "@tanstack/react-query";
import { VotingTokenEthers } from "@uma/contracts-frontend";
import { tokenAllowanceKey } from "constants/queryKeys";
import { getTokenAllowance } from "web3/queries";

export default function useTokenAllowance(votingTokenContract: VotingTokenEthers, address: string) {
  const { isLoading, isError, data, error } = useQuery(
    [tokenAllowanceKey],
    () => getTokenAllowance(votingTokenContract, address),
    {
      refetchInterval(data) {
        return data ? false : 1000;
      },
    }
  );

  return {
    tokenAllowance: data,
    tokenAllowanceIsLoading: isLoading,
    tokenAllowanceIsError: isError,
    tokenAllowanceError: error,
  };
}
