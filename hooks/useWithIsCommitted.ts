import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { withIsCommittedKey } from "constants/queryKeys";
import { makeUniqueKeysForVotes } from "helpers/votes";
import { PriceRequest, PriceRequestWithIsCommitted } from "types/global";
import getVotesCommittedByUser from "web3/queries/getVotesCommittedByUser";

export default function useWithIsCommitted(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  votes: PriceRequest[]
) {
  const { isLoading, isError, data, error } = useQuery(
    [withIsCommittedKey],
    () => getVotesCommittedByUser(votingContract, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!votes?.length && !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const keys = makeUniqueKeysForVotes(eventData);
  const withIsCommitted: PriceRequestWithIsCommitted[] =
    votes?.map((vote) => ({ ...vote, isCommitted: keys.includes(vote.uniqueKey) })) ?? votes;

  return {
    withIsCommitted,
    withIsCommittedIsLoading: isLoading,
    withIsCommittedIsError: isError,
    withIsCommittedError: error,
  };
}
