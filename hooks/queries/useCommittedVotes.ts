import { useQuery } from "@tanstack/react-query";
import { committedVotesKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getVotesCommittedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useCommittedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [committedVotesKey],
    () => getVotesCommittedByUser(voting, address),
    {
      refetchInterval: (data) => (data ? false : 100),
    }
  );

  return {
    committedVotes: data ?? {},
    committedVotesIsLoading: isLoading,
    committedVotesIsError: isError,
    committedVotesError: error,
  };
}
