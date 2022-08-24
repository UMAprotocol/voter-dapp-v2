import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makeUniqueKeysForVotes } from "helpers/votes";
import { PriceRequestT } from "types/global";
import getVotesCommittedByUser from "web3/queries/getVotesCommittedByUser";

export default function useWithIsCommitted(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  votes: PriceRequestT[]
) {
  const { isLoading, isError, data, error } = useQuery(
    ["withIsCommitted"],
    () => getVotesCommittedByUser(votingContract, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!votes?.length && !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const keys = makeUniqueKeysForVotes(eventData);

  const withIsCommitted = votes?.map((vote) => ({ ...vote, isCommitted: keys.includes(vote.uniqueKey) })) ?? votes;

  return {
    withIsCommitted,
    withIsCommittedIsLoading: isLoading,
    withIsCommittedIsError: isError,
    withIsCommittedError: error,
  };
}
