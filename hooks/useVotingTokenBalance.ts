import { useQuery } from "@tanstack/react-query";
import { VotingTokenEthers } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import getVotingTokenBalance from "web3/queries/getVotingTokenBalance";

export default function useVotingTokenBalance(votingTokenContract: VotingTokenEthers, address: string) {
  const { isLoading, isError, data, error } = useQuery(
    ["votingTokenBalance"],
    () => getVotingTokenBalance(votingTokenContract, address),
    {
      refetchInterval(data) {
        return data ? false : 1000;
      },
    }
  );

  return {
    votingTokenBalance: ethers.utils.formatEther(data?.[0] ?? 0),
    votingTokenBalanceIsLoading: isLoading,
    votingTokenBalanceIsError: isError,
    votingTokenBalanceError: error,
  };
}
