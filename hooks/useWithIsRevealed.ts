import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makeUniqueKeysForVotes } from "helpers/votes";
import { PriceRequest, PriceRequestWithIsRevealed } from "types/global";
import getVotesRevealedByUser from "web3/queries/getVotesRevealedByUser";

export default function useWithIsRevealed(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  votes: PriceRequest[]
) {
  const { isLoading, isError, data, error } = useQuery(
    ["withIsRevealed"],
    () => getVotesRevealedByUser(votingContract, address),
    {
      refetchInterval: 1000,
      enabled: !!votes?.length && !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const keys = makeUniqueKeysForVotes(eventData);
  const withIsRevealed: PriceRequestWithIsRevealed[] = votes?.map((vote) => ({
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
