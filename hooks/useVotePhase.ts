import { useQuery } from "@tanstack/react-query";
import getVotePhase from "web3/queries/getVotePhase";
import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function useVotePhase(votingContract: VotingV2Ethers) {
  const { isLoading, isError, data, error } = useQuery(["votePhase"], () => getVotePhase(votingContract));

  return {
    votePhaseIsLoading: isLoading,
    votePhaseIsError: isError,
    votePhase: data,
    votePhaseError: error,
  };
}
