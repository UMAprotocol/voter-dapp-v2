import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { TypedEvent } from "@uma/contracts-frontend/dist/typechain/core/ethers/commons";
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

  const encryptedVotesForUser = makeEncryptedVotesForUser(data, address);

  return {
    encryptedVotesForUser,
    encryptedVotesForUserIsLoading: isLoading,
    encryptedVotesForUserIsError: isError,
    encryptedVotesForUserError: error,
  };
}

function makeEncryptedVotesForUser(
  encryptedVoteEvents:
    | TypedEvent<
        [string, BigNumber, string, BigNumber, string, string] & {
          caller: string;
          roundId: BigNumber;
          identifier: string;
          time: BigNumber;
          ancillaryData: string;
          encryptedVote: string;
        }
      >[]
    | undefined,
  address: string
) {
  if (!encryptedVoteEvents) return [];

  const args = encryptedVoteEvents.map(({ args }) => args);

  return args.map(({ roundId, caller, identifier, time, ancillaryData, encryptedVote }) => ({
    roundId,
    caller,
    identifier,
    time,
    ancillaryData,
    encryptedVote,
  }))
}
