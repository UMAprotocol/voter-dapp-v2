import { useQuery } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getVotesRevealedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useRevealedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [revealedVotesKey],
    () => getVotesRevealedByUser(voting, address),
    {
      refetchInterval: (data) => (data ? false : 100),
    }
  );

  return {
    revealedVotes: data ?? {},
    revealedVotesIsLoading: isLoading,
    revealedVotesIsError: isError,
    revealedVotesError: error,
  };
}
