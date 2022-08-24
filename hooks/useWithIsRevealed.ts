import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { withIsRevealedKey } from "constants/queryKeys";
import { makeUniqueKeysForVotes } from "helpers/votes";
import { PriceRequestT } from "types/global";
import getVotesRevealedByUser from "web3/queries/getVotesRevealedByUser";

export default function useWithIsRevealed(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  votes: PriceRequestT[]
) {
  const { isLoading, isError, data, error } = useQuery(
    [withIsRevealedKey],
    () => getVotesRevealedByUser(votingContract, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!votes?.length && !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const keys = makeUniqueKeysForVotes(eventData);
  const withIsRevealed = votes?.map((vote) => ({
    ...vote,
    isRevealed: keys.includes(vote.uniqueKey),
  }));

  return {
    withIsRevealed,
    withIsRevealedIsLoading: isLoading,
    withIsRevealedIsError: isError,
    withIsRevealedError: error,
  };
}
