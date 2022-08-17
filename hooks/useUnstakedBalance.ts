import { useQuery } from "@tanstack/react-query";
import { VotingTokenEthers } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import getUnstakedBalance from "web3/queries/getUnstakedBalance";

export default function useUnstakedBalance(votingTokenContract: VotingTokenEthers, address: string) {
  const { isLoading, isError, data, error } = useQuery(
    ["unstakedBalance"],
    () => getUnstakedBalance(votingTokenContract, address),
    {
      refetchInterval(data) {
        return data ? false : 1000;
      },
    }
  );

  return {
    unstakedBalance: Number(ethers.utils.formatEther(data?.[0] ?? 0)),
    unstakedBalanceIsLoading: isLoading,
    unstakedBalanceIsError: isError,
    unstakedBalanceError: error,
  };
}
