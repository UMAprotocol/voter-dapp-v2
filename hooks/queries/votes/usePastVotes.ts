import { useQuery } from "@tanstack/react-query";
import { pastVotesKey } from "constant";
import { getPastVotes } from "graph";
import { useHandleError, useVoteTimingContext } from "hooks";

export function usePastVotes() {
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([pastVotesKey, roundId], () => getPastVotes(), {
    refetchInterval: (data) => (data ? false : 100),
    initialData: {},
    onError,
  });

  return queryResult;
}
