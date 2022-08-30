import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constants/queryKeys";
import { makeUniqueKeyForVote } from "helpers/votes";
import { useContractsContext } from "hooks/contexts";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import { UserEncryptedVotesByKeyT } from "types/global";
import { getEncryptedVotesForUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useEncryptedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();

  const { isLoading, isError, data, error } = useQuery(
    [encryptedVotesKey],
    () => getEncryptedVotesForUser(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!roundId && !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const encryptedVotes: UserEncryptedVotesByKeyT = {};
  eventData?.forEach(({ encryptedVote, identifier, time, ancillaryData }) => {
    encryptedVotes[makeUniqueKeyForVote(identifier, time, ancillaryData)] = encryptedVote;
  });

  return {
    encryptedVotes,
    encryptedVotesIsLoading: isLoading,
    encryptedVotesIsError: isError,
    encryptedVotesError: error,
  };
}
