import { useQuery } from "@tanstack/react-query";
import { withEncryptedVotesKey } from "constants/queryKeys";
import { makeUniqueKeyForVote } from "helpers/votes";
import { useContractsContext } from "hooks/contexts";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import { UserEncryptedVotesByKeyT } from "types/global";
import { getEncryptedVotesForUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useWithEncryptedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();

  const { isLoading, isError, data, error } = useQuery(
    [withEncryptedVotesKey],
    () => getEncryptedVotesForUser(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!roundId && !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const withEncryptedVotes: UserEncryptedVotesByKeyT = {};
  eventData?.forEach(({ encryptedVote, identifier, time, ancillaryData }) => {
    withEncryptedVotes[makeUniqueKeyForVote(identifier, time, ancillaryData)] = encryptedVote;
  });

  return {
    withEncryptedVotes,
    withEncryptedVotesIsLoading: isLoading,
    withEncryptedVotesIsError: isError,
    withEncryptedVotesError: error,
  };
}
