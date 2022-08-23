import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { withEncryptedVotesKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { makeUniqueKeyForVote } from "helpers/votes";
import { PriceRequest, PriceRequestWithEncryptedVote } from "types/global";
import getEncryptedVotesForUser from "web3/queries/getEncryptedVotesForUser";

export default function useWithEncryptedVotes(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  roundId: BigNumber | undefined,
  votes: PriceRequest[]
) {
  const { isLoading, isError, data, error } = useQuery(
    [withEncryptedVotesKey],
    () => getEncryptedVotesForUser(votingContract, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!roundId && !!address && !!votes?.length,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const encryptedVotesFromEvents = eventData?.map(({ encryptedVote, identifier, time, ancillaryData }) => ({
    encryptedVote,
    uniqueKey: makeUniqueKeyForVote(identifier, time, ancillaryData),
  }));
  const withEncryptedVotes: PriceRequestWithEncryptedVote[] = votes?.map((vote) => {
    const encryptedVoteEvent = encryptedVotesFromEvents?.find(({ uniqueKey }) => uniqueKey === vote.uniqueKey);
    return {
      ...vote,
      encryptedVote: encryptedVoteEvent?.encryptedVote,
    };
  });

  return {
    withEncryptedVotes,
    withEncryptedVotesIsLoading: isLoading,
    withEncryptedVotesIsError: isError,
    withEncryptedVotesError: error,
  };
}
