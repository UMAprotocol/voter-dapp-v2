import { useQuery } from "@tanstack/react-query";
import { pastVotesKey } from "constants/queryKeys";
import { getPastVotes } from "graph";
import { useHandleError, useVoteTimingContext } from "hooks";
import { usePaginationContext } from "hooks/contexts/usePaginationContext";

export function usePastVotes() {
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();
  const {
    pageStates: { pastVotesPage },
  } = usePaginationContext();

  const { resultsPerPage, number } = pastVotesPage;

  const queryResult = useQuery([pastVotesKey, roundId, pastVotesPage], () => getPastVotes(resultsPerPage, number), {
    refetchInterval: (data) => (data ? false : 100),
    initialData: {},
    onError,
    keepPreviousData: true,
  });

  return queryResult;
}
