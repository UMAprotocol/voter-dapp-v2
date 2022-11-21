import { useQuery } from "@tanstack/react-query";
import { activeVotesKey, oneSecond, phaseLengthMilliseconds } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
} from "hooks";
import { getActiveVotes } from "web3";

export function useActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();

  const shouldRefetch =
    phase === "commit" &&
    phaseLengthMilliseconds - millisecondsUntilPhaseEnds < 30 * oneSecond;

  const queryResult = useQuery(
    [activeVotesKey, roundId],
    () => getActiveVotes(voting),
    {
      refetchInterval: shouldRefetch ? 1000 : false,
      initialData: {
        activeVotes: {},
        hasActiveVotes: false,
      },
      onError,
    }
  );

  return queryResult;
}
