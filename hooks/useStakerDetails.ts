import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { addDays } from "date-fns";
import { ethers } from "ethers";
import getStakerDetails from "web3/queries/getStakerDetails";

export default function useStakerDetails(votingContract: VotingV2Ethers, address: string | undefined) {
  const { isLoading, isError, data, error } = useQuery(
    ["stakerDetails"],
    () => getStakerDetails(votingContract, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  const { outstandingRewards, pendingUnstake, rewardsPaidPerToken, unstakeRequestTime } = data ?? {};

  const unstakeRequestTimeAsDate = new Date(Number(unstakeRequestTime?.toNumber() ?? 0) * 1000);
  const canUnstakeTime = addDays(unstakeRequestTimeAsDate, 7);

  const stakerDetails = {
    outstandingRewards: Number(ethers.utils.formatEther(outstandingRewards ?? 0)),
    pendingUnstake: Number(ethers.utils.formatEther(pendingUnstake ?? 0)),
    rewardsPaidPerToken: Number(ethers.utils.formatEther(rewardsPaidPerToken ?? 0)),
    unstakeRequestTime: unstakeRequestTimeAsDate,
    canUnstakeTime,
  };

  return {
    stakerDetails,
    stakerDetailsIsLoading: isLoading,
    stakerDetailsIsError: isError,
    stakerDetailsError: error,
  };
}
