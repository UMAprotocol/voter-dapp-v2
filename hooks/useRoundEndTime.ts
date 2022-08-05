import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import getRoundEndTime from "web3/queries/getRoundEndTime";

export default function useRoundEndTime(votingContract: VotingV2Ethers, roundId: BigNumber | undefined) {
  const { isLoading, isError, data, error } = useQuery(
    ["roundEndTime"],
    () => getRoundEndTime(votingContract, roundId),
    {
      refetchInterval: 1000,
    }
  );

  return {
    roundEndTime: data?.[0],
    roundEndTimeIsLoading: isLoading,
    roundEndTimeIsError: isError,
    roundEndTimeError: error,
  };
}
