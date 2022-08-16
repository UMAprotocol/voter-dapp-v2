import { useQuery } from "@tanstack/react-query";
import { VotingTokenEthers } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import getTokenAllowance from "web3/queries/getTokenAllowance";

export default function useTokenAllowance(votingTokenContract: VotingTokenEthers, address: string) {
  const { isLoading, isError, data, error } = useQuery(
    ["tokenAllowance"],
    () => getTokenAllowance(votingTokenContract, address),
    {
      refetchInterval(data) {
        return data ? false : 1000;
      },
    }
  );

  return {
    tokenAllowance: ethers.utils.formatEther(data?.[0] ?? 0),
    tokenAllowanceIsLoading: isLoading,
    tokenAllowanceIsError: isError,
    tokenAllowanceError: error,
  };
}
