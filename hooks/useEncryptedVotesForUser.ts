import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { VoteT } from "types/global";
import getEncryptedVotesForUser from "web3/queries/getEncryptedVotesForUser";

export default function useEncryptedVotesForUser(
  votingContract: VotingV2Ethers,
  address: string,
  roundId: BigNumber | undefined,
  votes: VoteT[]
) {
  const { isLoading, isError, data, error } = useQuery(
    ["encryptedVotesForUser"],
    () => getEncryptedVotesForUser(votingContract, address, roundId),
    {
      refetchInterval: 1000,
      enabled: !!roundId,
    }
  );

  const encryptedVotesForUser = data
    ?.map(({ args }) => args)
    ?.map(({ roundId, caller, identifier, time, ancillaryData, encryptedVote }) => ({
      roundId,
      caller,
      identifier,
      time,
      ancillaryData,
      encryptedVote,
    }));

  const votesUserVotedOn = votes
    ?.map((vote) => {
      const encryptedVote = encryptedVotesForUser?.find(({ identifier, ancillaryData, time }) => {
        return vote.identifier === identifier && vote.ancillaryData === ancillaryData && vote.time === time.toNumber();
      });
      if (!encryptedVote) return null;
      return {
        ...vote,
        ...encryptedVote,
      };
    })
    .filter(Boolean);

  return {
    votesUserVotedOn,
    encryptedVotesForUserIsLoading: isLoading,
    encryptedVotesForUserIsError: isError,
    encryptedVotesForUserError: error,
  };
}
