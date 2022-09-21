import { useQuery } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { getVotesRevealedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useRevealedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();

  const { isLoading, isError, data, error } = useQuery(
    [revealedVotesKey],
    () => getVotesRevealedByUser(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
    }
  );

  return {
    revealedVotes: data ?? {},
    revealedVotesIsLoading: isLoading,
    revealedVotesIsError: isError,
    revealedVotesError: error,
  };
}
