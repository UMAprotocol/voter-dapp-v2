import { useQuery } from "@tanstack/react-query";
import { pastVotesKey } from "constant";
import { getPastVotesAllVersions } from "graph";
import { useHandleError, useVoteTimingContext } from "hooks";

export function usePastVotes() {
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [pastVotesKey, roundId],
    () => getPastVotesAllVersions(),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
