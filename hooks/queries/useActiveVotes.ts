import { useQuery } from "@tanstack/react-query";
import { activeVotesKey } from "constants/queryKeys";
import makePriceRequestsByKey from "helpers/makePriceRequestsByKey";
import { useContractsContext } from "hooks/contexts";
import { getPendingRequests } from "web3/queries";

export default function useActiveVotes() {
  const { voting } = useContractsContext();

  const { isLoading, isError, data, error } = useQuery([activeVotesKey], () => getPendingRequests(voting), {
    refetchInterval(data) {
      return data ? false : 100;
    },
  });

  const pendingRequests = data?.[0];
  const activeVotes = makePriceRequestsByKey(pendingRequests);

  return {
    activeVotes,
    activeVotesIsLoading: isLoading,
    activeVotesIsError: isError,
    activeVotesError: error,
  };
}
