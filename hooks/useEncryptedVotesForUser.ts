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
      refetchInterval: (data) => (data ? 10000 : 1000),
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
    }))
    ?.map(({ identifier, ancillaryData, time, encryptedVote }) => {
      const vote = votes.find(
        (vote) =>
          vote.identifier === identifier && vote.ancillaryData === ancillaryData && vote.time === time.toNumber()
      );
      return {
        ...vote,
        encryptedVote,
      };
    }) as VoteT[];

  return {
    encryptedVotesForUser,
    encryptedVotesForUserIsLoading: isLoading,
    encryptedVotesForUserIsError: isError,
    encryptedVotesForUserError: error,
  };
}
