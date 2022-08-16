import { useQuery } from "@tanstack/react-query";
import getVotePhase from "web3/queries/getVotePhase";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { VotePhaseT } from "types/global";

export default function useVotePhase(votingContract: VotingV2Ethers) {
  const { isLoading, isError, data, error } = useQuery(["votePhase"], () => getVotePhase(votingContract), {
    refetchInterval(data) {
      return data ? false : 1000;
    },
  });

  let votePhase: VotePhaseT = null;

  if (data?.length) {
    const phase = data[0];
    if (phase === 0) {
      votePhase = "commit";
    }
    if (phase === 1) {
      votePhase = "reveal";
    }
  }

  return {
    votePhase,
    votePhaseIsLoading: isLoading,
    votePhaseIsError: isError,
    votePhaseError: error,
  };
}
