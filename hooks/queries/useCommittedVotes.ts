import { useQuery } from "@tanstack/react-query";
import { committedVotesKey } from "constants/queryKeys";
import { makeUniqueKeyForVote } from "helpers/votes";
import { useContractsContext } from "hooks/contexts";
import { VoteExistsByKeyT } from "types/global";
import { getVotesCommittedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useCommittedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [committedVotesKey],
    () => getVotesCommittedByUser(voting, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const committedVotes: VoteExistsByKeyT = {};
  eventData?.forEach(({ identifier, time, ancillaryData }) => {
    committedVotes[makeUniqueKeyForVote(identifier, time, ancillaryData)] = true;
  });

  return {
    committedVotes,
    committedVotesIsLoading: isLoading,
    committedVotesIsError: isError,
    committedVotesError: error,
  };
}
