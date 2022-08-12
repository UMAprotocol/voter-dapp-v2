import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import getVotesRevealedByUser from "web3/queries/getVotesRevealedByUser";

export default function useVotesRevealedByUser(
  votingContract: VotingV2Ethers,
  address: string,
  roundId?: BigNumber | undefined
) {
  const { isLoading, isError, data, error } = useQuery(
    ["votesRevealedByUser"],
    () => getVotesRevealedByUser(votingContract, address),
    {
      refetchInterval: 1000,
    }
  );

  const votesRevealedByUser = data?.map(({ args }) => args);
  const votesRevealedByUserInCurrentRound = roundId
    ? votesRevealedByUser?.filter((vote) => vote.roundId.eq(roundId))
    : undefined;

  return {
    votesRevealedByUser,
    votesRevealedByUserInCurrentRound,
    votesRevealedByUserIsLoading: isLoading,
    votesRevealedByUserIsError: isError,
    votesRevealedByUserError: error,
  };
}
