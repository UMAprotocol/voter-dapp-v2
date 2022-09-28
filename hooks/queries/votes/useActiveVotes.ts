import { useQuery } from "@tanstack/react-query";
import { activeVotesKey } from "constants/queryKeys";
import { useContractsContext, useHandleError, useVoteTimingContext } from "hooks";
import { getActiveVotes } from "web3";

export function useActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([activeVotesKey, roundId], () => getActiveVotes(voting), {
    refetchInterval: (data) => (data ? false : 100),
    initialData: {},
    onError,
  });

  return queryResult;
}
