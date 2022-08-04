import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import getCurrentRoundId from "web3/queries/getCurrentRoundId";

export default function useCurrentRoundId(votingContract: VotingV2Ethers) {
  const { isLoading, isError, data, error } = useQuery(["currentRoundId"], () => getCurrentRoundId(votingContract));

  return {
    currentRoundId: data?.[0],
    currentRoundIdIsLoading: isLoading,
    currentRoundIdIsError: isError,
    currentRoundIdError: error,
  };
}
