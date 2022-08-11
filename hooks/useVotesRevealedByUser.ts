import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import getVotesRevealedByUser from "web3/queries/getVotesRevealedByUser";

export default function useVotesRevealedByUser(votingContract: VotingV2Ethers, address: string) {
  const { isLoading, isError, data, error } = useQuery(
    ["votesRevealedByUser"],
    () => getVotesRevealedByUser(votingContract, address),
    {
      refetchInterval: 1000,
    }
  );

  const votesRevealedByUser = data?.map(({ args }) => args);

  return {
    votesRevealedByUser,
    votesRevealedByUserIsLoading: isLoading,
    votesRevealedByUserIsError: isError,
    votesRevealedByUserError: error,
  };
}
