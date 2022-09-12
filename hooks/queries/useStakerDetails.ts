import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { stakerDetailsKey } from "constants/queryKeys";
import { ethers } from "ethers";
import getCanUnstakeTime from "helpers/getCanUnstakeTime";
import { getStakerDetails } from "web3/queries";

export default function useStakerDetails(votingContract: VotingV2Ethers, address: string | undefined) {
  const { isLoading, isError, data, error } = useQuery(
    [stakerDetailsKey],
    () => getStakerDetails(votingContract, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  const { pendingUnstake, unstakeRequestTime } = data ?? {};

  const unstakeRequestTimeAsDate = unstakeRequestTime ? new Date(Number(unstakeRequestTime.mul(1000))) : undefined;
  const canUnstakeTime = unstakeRequestTimeAsDate ? getCanUnstakeTime(unstakeRequestTimeAsDate) : undefined;

  const stakerDetails = {
    pendingUnstake: pendingUnstake ? Number(ethers.utils.formatEther(pendingUnstake)) : undefined,
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
