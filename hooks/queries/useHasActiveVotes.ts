import { useQuery } from "@tanstack/react-query";
import { hasActiveVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import getHasActiveVotes from "web3/queries/getHasActiveVotes";

export default function useHasActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();

  const queryResult = useQuery([hasActiveVotesKey, roundId], () => getHasActiveVotes(voting), {
    refetchInterval: (data) => (data ? false : 100),
  });

  return queryResult;
}
