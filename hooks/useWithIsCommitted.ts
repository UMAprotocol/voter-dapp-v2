import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makeUniqueKeysForVotes } from "helpers/votes";
import { VoteT } from "types/global";
import getVotesCommittedByUser from "web3/queries/getVotesCommittedByUser";

export default function useWithIsCommitted(votingContract: VotingV2Ethers, address: string, votes: VoteT[] | null) {
  const { isLoading, isError, data, error } = useQuery(
    ["withIsCommitted"],
    () => getVotesCommittedByUser(votingContract, address),
    {
      refetchInterval: 1000,
      enabled: !!votes,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const keys = makeUniqueKeysForVotes(eventData);
  const withIsCommitted = votes?.map((vote) => ({ ...vote, isCommitted: keys.includes(vote.uniqueKey) }));

  return {
    withIsCommitted,
    withIsCommittedIsLoading: isLoading,
    withIsCommittedIsError: isError,
    withIsCommittedError: error,
  };
}
