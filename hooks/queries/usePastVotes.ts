import { useQuery } from "@tanstack/react-query";
import { pastVotesKey } from "constants/queryKeys";
import { getPastVotes } from "graph/queries";
import { useVoteTimingContext } from "hooks/contexts";
import { useHandleError } from "hooks/helpers";

export default function usePastVotes() {
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([pastVotesKey, roundId], () => getPastVotes(), {
    refetchInterval: (data) => (data ? false : 100),
    initialData: {},
    onError,
  });

  return queryResult;
}
