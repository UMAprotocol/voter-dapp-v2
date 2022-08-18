import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import getUnstakeDetails from "web3/queries/getUnstakeDetails";

export default function useUnstakeDetails(votingContract: VotingV2Ethers, address: string | undefined) {
  const { isLoading, isError, data, error } = useQuery(
    ["unstakeDetails"],
    () => getUnstakeDetails(votingContract, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  const { outstandingRewards, pendingUnstake, rewardsPaidPerToken, unstakeRequestTime } = data ?? {};

  const unstakeDetails = {
    outstandingRewards: Number(ethers.utils.formatEther(outstandingRewards ?? 0)),
    pendingUnstake: Number(ethers.utils.formatEther(pendingUnstake ?? 0)),
    rewardsPaidPerToken: Number(ethers.utils.formatEther(rewardsPaidPerToken ?? 0)),
    unstakeRequestTime: new Date(Number(unstakeRequestTime?.toNumber() ?? 0) * 1000),
  };

  return {
    unstakeDetails,
    unstakeDetailsIsLoading: isLoading,
    unstakeDetailsIsError: isError,
    unstakeDetailsError: error,
  };
}
