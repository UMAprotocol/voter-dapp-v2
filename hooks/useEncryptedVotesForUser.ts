import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { makeUniqueKeyForVote } from "helpers/votes";
import { VoteT } from "types/global";
import getEncryptedVotesForUser from "web3/queries/getEncryptedVotesForUser";

export default function useEncryptedVotesForUser(
  votingContract: VotingV2Ethers,
  address: string,
  roundId: BigNumber | undefined,
  votes: VoteT[] | null
) {
  const { isLoading, isError, data, error } = useQuery(
    ["encryptedVotesForUser"],
    () => getEncryptedVotesForUser(votingContract, address, roundId),
    {
      refetchInterval: (data) => (data ? 10000 : 1000),
      enabled: !!roundId && !!votes,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const encryptedVotesFromEvents = eventData?.map(({ encryptedVote, identifier, time, ancillaryData }) => ({
    encryptedVote,
    uniqueKey: makeUniqueKeyForVote(identifier, time, ancillaryData),
  }));
  const encryptedVotesForUser = votes
    ?.map((vote) => {
      const encryptedVote = encryptedVotesFromEvents?.find(({ uniqueKey }) => uniqueKey === vote.uniqueKey);
      return {
        ...vote,
        encryptedVote: encryptedVote?.encryptedVote,
      };
    })
    .filter(({ encryptedVote }) => !!encryptedVote);

  return {
    encryptedVotesForUser,
    encryptedVotesForUserIsLoading: isLoading,
    encryptedVotesForUserIsError: isError,
    encryptedVotesForUserError: error,
  };
}
