import { useQuery } from "@tanstack/react-query";
import { pastVotesKey } from "constants/queryKeys";
import { getPastVotes } from "graph/queries";
import { useVoteTimingContext } from "hooks/contexts";

export default function usePastVotes() {
  const { roundId } = useVoteTimingContext();

  const queryResult = useQuery([pastVotesKey, roundId], () => getPastVotes(), {
    refetchInterval: (data) => (data ? false : 100),
    initialData: {},
  });

  return queryResult;
}
