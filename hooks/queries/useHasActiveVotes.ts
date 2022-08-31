import { useQuery } from "@tanstack/react-query";
import { hasActiveVotesKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import getHasActiveVotes from "web3/queries/getHasActiveVotes";

export default function useHasActiveVotes() {
  const { voting } = useContractsContext();

  const { isLoading, isError, data, error } = useQuery([hasActiveVotesKey], () => getHasActiveVotes(voting), {
    refetchInterval(data) {
      return data?.length ? false : 1000;
    },
  });

  const hasActiveVotes = data?.[0];

  return {
    hasActiveVotes,
    hasActiveVotesIsLoading: isLoading,
    hasActiveVotesIsError: isError,
    hasActiveVotesError: error,
  };
}
