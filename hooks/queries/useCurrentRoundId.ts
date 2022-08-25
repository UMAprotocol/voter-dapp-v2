import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { currentRoundIdKey } from "constants/queryKeys";
import { getCurrentRoundId } from "web3/queries";

export default function useCurrentRoundId(votingContract: VotingV2Ethers) {
  const { isLoading, isError, data, error } = useQuery([currentRoundIdKey], () => getCurrentRoundId(votingContract), {
    refetchInterval(data) {
      return data ? false : 1000;
    },
  });

  return {
    currentRoundId: data?.[0],
    currentRoundIdIsLoading: isLoading,
    currentRoundIdIsError: isError,
    currentRoundIdError: error,
  };
}
