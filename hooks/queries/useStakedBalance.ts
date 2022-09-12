import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { stakedBalanceKey } from "constants/queryKeys";
import { ethers } from "ethers";
import { getStakedBalance } from "web3/queries";

export default function useStakedBalance(votingContract: VotingV2Ethers, address: string) {
  const { isLoading, isError, data, error } = useQuery(
    [stakedBalanceKey],
    () => getStakedBalance(votingContract, address),
    {
      refetchInterval(data) {
        return data ? false : 1000;
      },
    }
  );

  return {
    stakedBalance: Number(ethers.utils.formatEther(data?.[0] ?? 0)),
    stakedBalanceIsLoading: isLoading,
    stakedBalanceIsError: isError,
    stakedBalanceError: error,
  };
}
