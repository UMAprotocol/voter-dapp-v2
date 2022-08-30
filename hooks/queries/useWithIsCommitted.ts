import { useQuery } from "@tanstack/react-query";
import { withIsCommittedKey } from "constants/queryKeys";
import { makeUniqueKeyForVote } from "helpers/votes";
import { useContractsContext } from "hooks/contexts";
import { VoteExistsByKeyT } from "types/global";
import { getVotesCommittedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useWithIsCommitted() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [withIsCommittedKey],
    () => getVotesCommittedByUser(voting, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const withIsCommitted: VoteExistsByKeyT = {};
  eventData?.forEach(({ identifier, time, ancillaryData }) => {
    withIsCommitted[makeUniqueKeyForVote(identifier, time, ancillaryData)] = true;
  });

  return {
    withIsCommitted,
    withIsCommittedIsLoading: isLoading,
    withIsCommittedIsError: isError,
    withIsCommittedError: error,
  };
}
