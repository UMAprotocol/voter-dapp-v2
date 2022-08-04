import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import getPendingRequests from "web3/queries/getPendingRequests";

export default function useActiveVotes(votingContract: VotingV2Ethers) {
  const { isLoading, isError, data, error } = useQuery(["activeVotes"], () => getPendingRequests(votingContract), {
    refetchInterval(data) {
      return data?.length ? 10000 : 1000;
    },
  });

  return {
    activeVotes: data,
    activeVotesIsLoading: isLoading,
    activeVotesIsError: isError,
    activeVotesError: error,
  };
}
