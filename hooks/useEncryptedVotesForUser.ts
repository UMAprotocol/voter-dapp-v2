import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import getEncryptedVotesForUser from "web3/queries/getEncryptedVotesForUser";

export default function useEncryptedVotesForUser(
  votingContract: VotingV2Ethers,
  address: string,
  roundId: BigNumber | undefined
) {
  const { isLoading, isError, data, error } = useQuery(
    ["encryptedVotesForUser"],
    () => getEncryptedVotesForUser(votingContract, address, roundId),
    {
      refetchInterval: 1000,
    }
  );

  const encryptedVotesForUser = roundId ? data : [];

  return {
    encryptedVotesForUser,
    encryptedVotesForUserIsLoading: isLoading,
    encryptedVotesForUserIsError: isError,
    encryptedVotesForUserError: error,
  };
}
