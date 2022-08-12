import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import getVotesCommittedByUser from "web3/queries/getVotesCommittedByUser";

export default function useVotesCommittedByUser(
  votingContract: VotingV2Ethers,
  address: string,
  roundId?: BigNumber | undefined
) {
  const { isLoading, isError, data, error } = useQuery(
    ["votesCommittedByUser"],
    () => getVotesCommittedByUser(votingContract, address),
    {
      refetchInterval: 1000,
    }
  );

  const votesCommittedByUser = data?.map(({ args }) => args);
  const votesCommittedByUserInCurrentRound = roundId
    ? votesCommittedByUser?.filter((vote) => vote.roundId.eq(roundId))
    : undefined;

  return {
    votesCommittedByUser,
    votesCommittedByUserInCurrentRound,
    votesCommittedByUserIsLoading: isLoading,
    votesCommittedByUserIsError: isError,
    votesCommittedByUserError: error,
  };
}
